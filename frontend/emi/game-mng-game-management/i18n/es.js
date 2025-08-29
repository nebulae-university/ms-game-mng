export default {
  navigation: {
    'settings': 'Configuraciones',
    'game-mng-game-management': 'Games',
  },
  games: {
    games: 'Games',
    search: 'Búsqueda rápida por nombre',
    add_new_game: 'Agregar',
    add_new_game_short: '+',
    import_game: 'Importar',
    import_game_short: 'Importar',
    rows_per_page: 'Filas por página:',
    of: 'de',
    remove: 'Eliminar',
    table_colums: {
      name: 'Nombre',
      active: 'Activo'
    },
    remove_dialog_title: "¿Desea eliminar las games seleccionadas?",
    remove_dialog_description: "Esta acción no se puede deshacer",
    remove_dialog_no: "No",
    remove_dialog_yes: "Si",
    filters: {
      title: "Filtros",
      active: "Activo"
    }
  },
  game: {
    games: 'Games',
    game_detail: 'Detalle de la Game',
    save: 'GUARDAR',
    queryDetails: 'CONSULTAR DETALLES',
    basic_info: 'Información Básica',
    name: 'Nombre',
    description: 'Descripción',
    active: 'Activo',
    metadata_tab: 'Metadatos',
    metadata: {
      createdBy: 'Creado por',
      createdAt: 'Creado el',
      updatedBy: 'Modificado por',
      updatedAt: 'Modificado el',
    },
    not_found: 'Lo sentimos pero no pudimos encontrar la entidad que busca',
    internal_server_error: 'Error Interno del Servidor',
    update_success: 'Game ha sido actualizado',
    create_success: 'Game ha sido creado',
    form_validations: {
      name: {
        length: "El nombre debe tener al menos {len} caracteres",
        required: "El nombre es requerido",
        hex_required: "Si el nombre tiene más de 10 caracteres, debe ser una cadena hexadecimal válida con un número par de caracteres"
      }
    },
  }
};