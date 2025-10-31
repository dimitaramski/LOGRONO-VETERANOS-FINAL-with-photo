import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Navigation
      'fixtures': 'Partidos',
      'standings': 'Clasificación',
      'topScorers': 'Máximos Goleadores',
      'login': 'Iniciar Sesión',
      'logout': 'Cerrar Sesión',
      'home': 'Inicio',
      
      // Homepage
      'welcomeTo': 'Bienvenido a',
      'ligaVeteranos': 'Liga Veteranos',
      'heroText': 'Experimenta la pasión del fútbol veterano en Logroño. Dos divisiones, 24 equipos, una comunidad unida por el amor al juego.',
      'subscribeFor': 'Suscribirse por €5/Temporada',
      'viewStandings': 'Ver Clasificación',
      
      // Features
      'weeklyFixtures': 'Partidos Semanales',
      'weeklyFixturesDesc': 'Sigue todos los partidos semana a semana. Mantente actualizado con calendarios y resultados de ambas divisiones.',
      'liveStandings': 'Clasificación en Vivo',
      'liveStandingsDesc': 'Sigue la posición de tu equipo en tiempo real. Estadísticas completas incluyendo victorias, empates y diferencia de goles.',
      'topScorersTitle': 'Máximos Goleadores',
      'topScorersDesc': 'Celebra a los mejores goleadores de la liga. Mira quién lidera la carrera por la bota de oro.',
      
      // Divisions
      'twoDivisions': 'Dos Divisiones',
      'firstDivision': '1ª División',
      'firstDivisionDesc': 'La división premier con 12 equipos veteranos de élite compitiendo al más alto nivel.',
      'secondDivision': '2ª División',
      'secondDivisionDesc': '12 equipos ambiciosos luchando por el ascenso y la gloria en la segunda división.',
      
      // Instagram
      'highlightsStories': 'Momentos Destacados e Historias',
      'highlightsDesc': 'Revive los mejores momentos, entrevistas con jugadores y contenido tras bambalinas de Liga Veteranos',
      'scrollMore': '← Desliza para ver más →',
      
      // Fixtures
      'fixturesTitle': 'Partidos',
      'allWeeks': 'Todas las Semanas',
      'week': 'Semana',
      'firstHalf': 'Primera Vuelta',
      'secondHalf': 'Segunda Vuelta',
      'noMatchesScheduled': 'No hay partidos programados todavía',
      'checkBackLater': 'Vuelve más tarde para actualizaciones',
      'live': 'EN VIVO',
      'halftime': 'Descanso',
      'fullTime': 'Final',
      'vs': 'VS',
      
      // Standings
      'standingsTitle': 'Clasificación',
      'position': 'Pos',
      'team': 'Equipo',
      'gp': 'PJ',
      'w': 'G',
      'd': 'E',
      'l': 'P',
      'gf': 'GF',
      'ga': 'GC',
      'gd': 'DG',
      'pts': 'Pts',
      'noStandingsData': 'No hay datos de clasificación disponibles todavía',
      
      // Top Scorers
      'topScorersPageTitle': 'Máximos Goleadores',
      'rank': 'Puesto',
      'player': 'Jugador',
      'goals': 'Goles',
      'noGoalsScored': 'No se han marcado goles esta temporada todavía',
      
      // Match Details
      'matchDetails': 'Detalles del Partido',
      'goalScorers': 'Goleadores',
      'cards': 'Tarjetas',
      'noMatchEvents': 'No hay eventos del partido registrados todavía',
      
      // Admin
      'adminDashboard': 'Panel de Administración',
      'teams': 'Equipos',
      'players': 'Jugadores',
      'users': 'Usuarios',
      'instagram': 'Instagram',
      'addTeam': '+ Añadir Equipo',
      'addPlayer': '+ Añadir Jugador',
      'addFixture': '+ Añadir Partido',
      'addUser': '+ Añadir Usuario',
      'addPost': '+ Añadir Publicación',
      'edit': 'Editar',
      'delete': 'Eliminar',
      'loading': 'Cargando...',
      
      // Team Dashboard
      'yourFixtures': 'Tus Partidos',
      'updateScore': 'Actualizar Resultado',
      'addGoalScorer': 'Añadir Goleador',
      'addCard': 'Añadir Tarjeta',
      
      // Forms
      'teamName': 'Nombre del Equipo',
      'division': 'División',
      'teamLogo': 'Logo del Equipo (Opcional)',
      'playerName': 'Nombre del Jugador',
      'jerseyNumber': 'Número de Camiseta (Opcional)',
      'username': 'Nombre de Usuario',
      'password': 'Contraseña',
      'role': 'Rol',
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'create': 'Crear',
      'update': 'Actualizar',
    }
  },
  en: {
    translation: {
      // Navigation
      'fixtures': 'Fixtures',
      'standings': 'Standings',
      'topScorers': 'Top Scorers',
      'login': 'Login',
      'logout': 'Logout',
      'home': 'Home',
      
      // Homepage
      'welcomeTo': 'Welcome to',
      'ligaVeteranos': 'Liga Veteranos',
      'heroText': 'Experience the passion of veteran football in Logroño. Two divisions, 24 teams, one community united by the love of the game.',
      'subscribeFor': 'Subscribe for €5/Season',
      'viewStandings': 'View Standings',
      
      // Features
      'weeklyFixtures': 'Weekly Fixtures',
      'weeklyFixturesDesc': 'Follow all matches week by week. Stay updated with schedules and results from both divisions.',
      'liveStandings': 'Live Standings',
      'liveStandingsDesc': 'Track your team\'s position in real-time. Complete statistics including wins, draws, and goal difference.',
      'topScorersTitle': 'Top Scorers',
      'topScorersDesc': 'Celebrate the league\'s top goal scorers. See who\'s leading the race for the golden boot.',
      
      // Divisions
      'twoDivisions': 'Two Divisions',
      'firstDivision': '1st Division',
      'firstDivisionDesc': 'The premier division featuring 12 elite veteran teams competing at the highest level.',
      'secondDivision': '2nd Division',
      'secondDivisionDesc': '12 ambitious teams fighting for promotion and glory in the second tier.',
      
      // Instagram
      'highlightsStories': 'Highlights & Stories',
      'highlightsDesc': 'Relive the best moments, player interviews, and behind-the-scenes content from Liga Veteranos',
      'scrollMore': '← Scroll to see more →',
      
      // Fixtures
      'fixturesTitle': 'Fixtures',
      'allWeeks': 'All Weeks',
      'week': 'Week',
      'firstHalf': 'First Half',
      'secondHalf': 'Second Half',
      'noMatchesScheduled': 'No matches scheduled yet',
      'checkBackLater': 'Check back later for fixture updates',
      'live': 'LIVE',
      'halftime': 'HT',
      'fullTime': 'FT',
      'vs': 'VS',
      
      // Standings
      'standingsTitle': 'Standings',
      'position': 'Pos',
      'team': 'Team',
      'gp': 'GP',
      'w': 'W',
      'd': 'D',
      'l': 'L',
      'gf': 'GF',
      'ga': 'GA',
      'gd': 'GD',
      'pts': 'Pts',
      'noStandingsData': 'No standings data available yet',
      
      // Top Scorers
      'topScorersPageTitle': 'Top Scorers',
      'rank': 'Rank',
      'player': 'Player',
      'goals': 'Goals',
      'noGoalsScored': 'No goals scored yet this season',
      
      // Match Details
      'matchDetails': 'Match Details',
      'goalScorers': 'Goal Scorers',
      'cards': 'Cards',
      'noMatchEvents': 'No match events recorded yet',
      
      // Admin
      'adminDashboard': 'Admin Dashboard',
      'teams': 'Teams',
      'players': 'Players',
      'users': 'Users',
      'instagram': 'Instagram',
      'addTeam': '+ Add Team',
      'addPlayer': '+ Add Player',
      'addFixture': '+ Add Fixture',
      'addUser': '+ Add User',
      'addPost': '+ Add Post',
      'edit': 'Edit',
      'delete': 'Delete',
      'loading': 'Loading...',
      
      // Team Dashboard
      'yourFixtures': 'Your Fixtures',
      'updateScore': 'Update Score',
      'addGoalScorer': 'Add Goal Scorer',
      'addCard': 'Add Card',
      
      // Forms
      'teamName': 'Team Name',
      'division': 'Division',
      'teamLogo': 'Team Logo (Optional)',
      'playerName': 'Player Name',
      'jerseyNumber': 'Jersey Number (Optional)',
      'username': 'Username',
      'password': 'Password',
      'role': 'Role',
      'save': 'Save',
      'cancel': 'Cancel',
      'create': 'Create',
      'update': 'Update',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Spanish as default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;