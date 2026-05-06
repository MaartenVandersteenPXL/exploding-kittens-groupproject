using ExplodingKittens.Api.Models;
using ExplodingKittens.Api.Models.Output;
using ExplodingKittens.Core.TableAggregate;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ExplodingKittens.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TablesController : ApiControllerBase
{
    private readonly ITableManager _tableManager;
    private readonly ITableRepository _tableRepository;
    private readonly IModelMapper _mapper;
    private readonly UserManager<User> _userManager;

    public TablesController(ITableManager tableManager, ITableRepository tableRepository, IModelMapper mapper, UserManager<User> userManager)
    {
        _tableManager = tableManager;
        _tableRepository = tableRepository;
        _mapper = mapper;
        _userManager = userManager;
    }

    /// <summary>
    /// Find the tables that have a seat available.
    /// Only tables that match the given <paramref name="preferences"/> are returned.
    /// </summary>
    /// <param name="preferences">Only tables matching these preferences are returned</param>
    [HttpGet("with-available-seats")]
    [ProducesResponseType(typeof(IList<TableModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetTablesWithAvailableSeats([FromQuery] TablePreferences preferences)
    {
        IList<ITable> tables = _tableRepository.FindTablesWithAvailableSeats(preferences);
        IList<TableModel> models = tables.Select(table => _mapper.MapTable(table)).ToList();
        return Ok(models);
    }

    /// <summary>
    /// Gets a specific table by its id.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TableModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetTableById(Guid id)
    {
        ITable table = _tableRepository.Get(id);
        TableModel model = _mapper.MapTable(table);
        return Ok(model);
    }

    /// <summary>
    /// Creates a new table and lets the current user join the new table.
    /// </summary>
    /// <param name="preferences">
    /// Contains info about the type of game you want to play.
    /// </param>
    /// <remarks>Tables are automatically removed from the system after 15 minutes.</remarks>
    [HttpPost]
    [ProducesResponseType(typeof(TableModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorModel), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] TablePreferences preferences)
    {
        User currentUser = (await _userManager.GetUserAsync(User))!;
        ITable table = _tableManager.CreateTable(currentUser, preferences);
        TableModel tableModel = _mapper.MapTable(table);

        return CreatedAtAction(nameof(GetTableById), new { id = table.Id }, tableModel);
    }

    /// <summary>
    /// Joins a user to a table.
    /// If the table has no available seats left, the game is started.
    /// </summary>
    /// <param name="id">
    /// The unique identifier of the table.
    /// </param>
    [HttpPost("{id}/join")]
    [ProducesResponseType(typeof(TableModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorModel), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Join(Guid id)
    {
        User currentUser = (await _userManager.GetUserAsync(User))!;
        ITable table = _tableManager.JoinTable(id, currentUser);

        if(!table.HasAvailableSeat)
        {
            _tableManager.StartGameForTable(table.Id);
        }
        
        TableModel tableModel = _mapper.MapTable(table);

        return Ok(tableModel);
    }

    /// <summary>
    /// Removes the user that is logged in from a table.
    /// If no players are left at the table, the table is removed from the system.
    /// </summary>
    /// <param name="id">
    /// The unique identifier of the table.
    /// </param>
    [HttpPost("{id}/leave")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorModel), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Leave(Guid id)
    {
        User currentUser = (await _userManager.GetUserAsync(User))!;
        _tableManager.LeaveTable(id, currentUser);
        return Ok();
    }
}