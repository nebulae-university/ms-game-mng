export default {
  navigation: {
    'settings': 'Settings',
    'game-mng-game-management': 'Games',
  },
  games: {
    games: 'Games',
    search: 'Quick search by name',
    add_new_game: 'ADD NEW',
    add_new_game_short: 'NEW',
    import_game: 'IMPORT',
    import_game_short: 'IMPORT',
    game_stats: 'Game Statistics',
    game_stats_short: 'Stats',
    rows_per_page: 'Rows per page:',
    of: 'of',
    remove: 'Remove',
    table_colums: {
      name: 'Name',
      active: 'Active'
    },
    remove_dialog_title: "Do you want to delete the selected Games??",
    remove_dialog_description: "This action can not be undone",
    remove_dialog_no: "No",
    remove_dialog_yes: "Yes",
    filters: {
      title: "Filters",
      active: "Active"
    },
    high_performance: 'High Performance'
  },
  game: {
    games: 'Games',
    game_detail: 'Game detail',
    save: 'SAVE',
    queryDetails: 'QUERY DETAILS',
    basic_info: 'Basic Info',
    name: 'Name',
    description: 'Description',
    active: 'Active',
    metadata_tab: 'Metadata',
    metadata: {
      createdBy: 'Created by',
      createdAt: 'Created at',
      updatedBy: 'Modified by',
      updatedAt: 'Modified at',
    },
    not_found: 'Sorry but we could not find the entity you are looking for',
    internal_server_error: 'Internal Server Error',
    update_success: 'Game has been updated',
    create_success: 'Game has been created',
    form_validations: {
      name: {
        length: "Name must be at least {len} characters",
        required: "Name is required",
        hex_required: "If name is longer than 10 characters, it must be a valid hex string with an even number of characters"
      }
    },
  }
};