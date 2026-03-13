type Language = 'en' | 'et';

type Translations = {
  [key: string]: {
    en: string;
    et: string;
  };
};

const translations: Translations = {
  browse: { en: 'Browse', et: 'Sirvi' },
  categories: { en: 'Categories', et: 'Kategooriad' },
  sell: { en: 'Sell', et: 'Müü' },
  messages: { en: 'Messages', et: 'Sõnumid' },
  profile: { en: 'Profile', et: 'Profiil' },
  favorites: { en: 'Favorites', et: 'Lemmikud' },
  settings: { en: 'Settings', et: 'Seaded' },
  signIn: { en: 'Sign In', et: 'Logi sisse' },
  logout: { en: 'Logout', et: 'Logi välja' },
  menu: { en: 'Menu', et: 'Menüü' },
  search: { en: 'Search', et: 'Otsi' },

  language: { en: 'Language', et: 'Keel' },
  chooseLanguage: { en: 'Choose your preferred language', et: 'Vali oma eelistatud keel' },
  estonian: { en: 'Estonian', et: 'Eesti keel' },
  english: { en: 'English', et: 'Inglise keel' },

  darkMode: { en: 'Dark Mode', et: 'Tume režiim' },
  toggleDarkMode: { en: 'Toggle dark theme on or off', et: 'Lülita tume teema sisse või välja' },

  version: { en: 'Version', et: 'Versioon' },
  builtWith: { en: 'Built with', et: 'Ehitatud' },

  noFavorites: { en: 'No favorites yet', et: 'Lemmikuid pole veel' },
  saveFavorites: { en: 'Save listings to see them here', et: 'Salvesta kuulutusi, et need siin kuvada' },

  viewAll: { en: 'View all', et: 'Vaata kõiki' },
  recentListings: { en: 'Recent Listings', et: 'Viimased kuulutused' },
  noListingsYet: { en: 'No listings yet in this category', et: 'Selles kategoorias pole veel kuulutusi' },
  loading: { en: 'Loading...', et: 'Laadimine...' },

  filteredResults: { en: 'Filtered Results', et: 'Filtreeritud tulemused' },
  filters: { en: 'Filters', et: 'Filtrid' },
  searchInResults: { en: 'Search in results...', et: 'Otsi tulemustest...' },
  noListingsWithFilters: { en: 'No listings found with these filters', et: 'Nende filtritega kuulutusi ei leitud' },

  browseListings: { en: 'Browse Listings', et: 'Sirvi kuulutusi' },
  searchForDiscs: { en: 'Search for discs, bags, accessories...', et: 'Otsi kettaid, kotte, aksessuaare...' },
  noListingsFound: { en: 'No listings found', et: 'Kuulutusi ei leitud' },

  createListing: { en: 'Create Listing', et: 'Loo kuulutus' },
  listingType: { en: 'Listing Type', et: 'Kuulutuse tüüp' },
  forSale: { en: 'For Sale', et: 'Müün' },
  wanted: { en: 'Wanted', et: 'Soovin osta' },
  title: { en: 'Title', et: 'Pealkiri' },
  titlePlaceholder: { en: 'e.g., Innova Destroyer - Star Plastic', et: 'nt Innova Destroyer - Star plastik' },
  description: { en: 'Description', et: 'Kirjeldus' },
  descriptionPlaceholder: { en: 'Describe the item, include any details about wear, flight characteristics, etc.', et: 'Kirjelda eset, lisa detaile kulumise, lenduomaduste jms kohta' },
  price: { en: 'Price', et: 'Hind' },
  pricePlaceholder: { en: '0.00', et: '0.00' },
  category: { en: 'Category', et: 'Kategooria' },
  selectCategory: { en: 'Select category', et: 'Vali kategooria' },
  condition: { en: 'Condition', et: 'Seisukord' },
  selectCondition: { en: 'Select condition', et: 'Vali seisukord' },
  location: { en: 'Location', et: 'Asukoht' },
  locationPlaceholder: { en: 'City', et: 'Linn' },
  discSpeed: { en: 'Disc Speed (optional, 1-14)', et: 'Ketta kiirus (valikuline, 1-14)' },
  discSpeedPlaceholder: { en: 'e.g., 12 for distance drivers', et: 'nt 12 kaugheiteketastele' },
  images: { en: 'Images', et: 'Pildid' },
  addImageUrl: { en: 'Add Image URL', et: 'Lisa pildi URL' },
  creating: { en: 'Creating...', et: 'Loomine...' },

  editProfile: { en: 'Edit Profile', et: 'Muuda profiili' },
  username: { en: 'Username', et: 'Kasutajanimi' },
  bio: { en: 'Bio', et: 'Tutvustus' },
  bioPlaceholder: { en: 'Tell others about yourself and your disc golf experience...', et: 'Räägi endast ja oma discgolfi kogemusest...' },
  cityStatePlaceholder: { en: 'City, State', et: 'Linn, maakond' },
  cancel: { en: 'Cancel', et: 'Tühista' },
  saving: { en: 'Saving...', et: 'Salvestamine...' },
  saveChanges: { en: 'Save Changes', et: 'Salvesta muudatused' },

  profileNotFound: { en: 'Profile not found', et: 'Profiili ei leitud' },
  reviews: { en: 'reviews', et: 'arvustust' },
  joined: { en: 'Joined', et: 'Liitus' },
  edit: { en: 'Edit', et: 'Muuda' },
  listings: { en: 'Listings', et: 'Kuulutused' },
  noListings: { en: 'No listings yet', et: 'Kuulutusi pole veel' },

  listingDetails: { en: 'Listing Details', et: 'Kuulutuse detailid' },
  wantedBadge: { en: 'WANTED', et: 'SOOVIN OSTA' },
  conditionScore: { en: 'Condition', et: 'Seisukord' },
  speed: { en: 'Speed', et: 'Kiirus' },
  sellerInformation: { en: 'Seller Information', et: 'Müüja informatsioon' },
  listingCount: { en: 'listings', et: 'kuulutust' },
  contactSeller: { en: 'Contact Seller', et: 'Võta ühendust müüjaga' },
  signInToContact: { en: 'Sign in to Contact Seller', et: 'Logi sisse müüjaga ühenduse võtmiseks' },
  listingNotFound: { en: 'Listing not found', et: 'Kuulutust ei leitud' },

  all: { en: 'All', et: 'Kõik' },
  allCategories: { en: 'All Categories', et: 'Kõik kategooriad' },
  priceRange: { en: 'Price Range', et: 'Hinnavahemik' },
  min: { en: 'Min', et: 'Min' },
  max: { en: 'Max', et: 'Max' },
  minimumCondition: { en: 'Minimum Condition Score', et: 'Minimaalne seisukorra hinne' },
  anyCondition: { en: 'Any Condition', et: 'Suvaline seisukord' },
  condition9: { en: '9/10 or better', et: '9/10 või parem' },
  condition8: { en: '8/10 or better', et: '8/10 või parem' },
  condition7: { en: '7/10 or better', et: '7/10 või parem' },
  condition6: { en: '6/10 or better', et: '6/10 või parem' },
  condition5: { en: '5/10 or better', et: '5/10 või parem' },
  discSpeedRange: { en: 'Disc Speed Range', et: 'Ketta kiirusvahemik' },
  minSpeed: { en: 'Min (1-14)', et: 'Min (1-14)' },
  maxSpeed: { en: 'Max (1-14)', et: 'Max (1-14)' },
  enterLocation: { en: 'Enter city or area', et: 'Sisesta linn või piirkond' },
  clearAll: { en: 'Clear All', et: 'Tühista kõik' },
  applyFilters: { en: 'Apply Filters', et: 'Rakenda filtrid' },

  typeMessage: { en: 'Type a message...', et: 'Kirjuta sõnum...' },
  noMessages: { en: 'No messages yet', et: 'Sõnumeid pole veel' },

  noListingsInCategory: { en: 'No listings in this category', et: 'Selles kategoorias pole kuulutusi' },

  welcomeBack: { en: 'Welcome Back', et: 'Tere tulemast tagasi' },
  tryDemo: { en: 'Try Demo Account', et: 'Proovi demo kontot' },
  demoEmail: { en: 'demo@discswap.com', et: 'demo@discswap.com' },
  demoPassword: { en: 'demo123', et: 'demo123' },
  fillDemo: { en: 'Click to fill demo credentials', et: 'Klõpsa demo andmete täitmiseks' },
  email: { en: 'Email', et: 'E-post' },
  emailPlaceholder: { en: 'you@example.com', et: 'sina@naide.ee' },
  password: { en: 'Password', et: 'Parool' },
  passwordPlaceholder: { en: 'Enter your password', et: 'Sisesta oma parool' },
  signingIn: { en: 'Signing in...', et: 'Sisselogimine...' },
  noAccount: { en: "Don't have an account?", et: 'Pole kontot?' },
  signUp: { en: 'Sign up', et: 'Registreeru' },

  createAccount: { en: 'Create Account', et: 'Loo konto' },
  passwordMinLength: { en: 'Password must be at least 6 characters long', et: 'Parool peab olema vähemalt 6 tähemärki pikk' },
  usernameMinLength: { en: 'Username must be at least 3 characters long', et: 'Kasutajanimi peab olema vähemalt 3 tähemärki pikk' },
  usernamePlaceholder: { en: 'discgolfpro', et: 'discgolfipro' },
  passwordMinPlaceholder: { en: 'At least 6 characters', et: 'Vähemalt 6 tähemärki' },
  creatingAccount: { en: 'Creating account...', et: 'Konto loomine...' },
  accountCreated: { en: 'Account Created!', et: 'Konto loodud!' },
  canSignIn: { en: 'You can now sign in with your credentials.', et: 'Nüüd saad sisse logida oma andmetega.' },
  goToSignIn: { en: 'Go to Sign In', et: 'Mine sisselogimisele' },
  haveAccount: { en: 'Already have an account?', et: 'Juba on konto olemas?' },

  myListings: { en: 'My Listings', et: 'Minu kuulutused' },
  activeListings: { en: 'Active', et: 'Aktiivsed' },
  soldListings: { en: 'Sold', et: 'Müüdud' },
  markAsSold: { en: 'Mark as Sold', et: 'Märgi müüduks' },
  deleteListing: { en: 'Delete', et: 'Kustuta' },
  editListing: { en: 'Edit', et: 'Muuda' },
  confirmDelete: { en: 'Are you sure you want to delete this listing?', et: 'Kas oled kindel, et soovid selle kuulutuse kustutada?' },
  noActiveListings: { en: 'No active listings', et: 'Pole aktiivseid kuulutusi' },
  noSoldListings: { en: 'No sold listings', et: 'Pole müüdud kuulutusi' },
  favoriteCount: { en: 'favorites', et: 'lemmikut' },
};

export function t(key: string, language: Language): string {
  return translations[key]?.[language] || key;
}
