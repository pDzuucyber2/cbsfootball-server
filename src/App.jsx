import React, { useState, createContext, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./index.css";

// ================= COMPONENTS =================
import BottomNav from "./Components/BottomNav";
import InstallButton from "./Components/InstallButton";
import PosterTemplate from "./Components/PosterTemplate";
import SpecialGames from "./Components/SpecialGames";
import AboutContraBetScore from "./Components/AboutContraBetScore";


import TopBar from "./Components/TopBar";
import EditField from "./Components/EditField";
import { BalanceProvider } from "./context/BalanceContext";
// ================= LAZY PAGES =================

// Extra
const Groups = lazy(() => import("./pages/Groups"));
const MarketCards = lazy(() => import("./pages/MarketCards"));

// User
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));
const MyPage = lazy(() => import("./pages/MyPage"));
const AneyBonus = lazy(() => import("./pages/AneyBonus"));
const TradeList = lazy(() => import("./pages/TradeList"));
const History = lazy(() => import("./pages/History"));
const Menu = lazy(() => import("./pages/Menu"));
const Betslip = lazy(() => import("./pages/Betslip"));
const UserRefunds = lazy(() => import("./pages/UserRefunds"));

const Monthly = lazy(() => import("./pages/Monthly"));
const Team = lazy(() => import("./pages/Team"));
const About = lazy(() => import("./pages/About"));
const EventList = lazy(() => import("./pages/EventList"));
const InvertLink = lazy(() => import("./pages/InvertLink"));
const AgentIntro = lazy(() => import("./pages/AgentIntro"));
const AviatorHistory = lazy(() => import("./pages/AviatorHistory"));
const AviatorMyBets = lazy(() => import("./pages/AviatorMyBets"));
const AdminViewAviators = lazy(() => import("./pages/AdminViewAviators"));
const OtherCountryWallet = lazy(() => import("./pages/OtherCountryWallet"));

import TotalBalance from "./pages/TotalBalance";
import SuccessfulDeposits from "./pages/SuccessfulDeposits";
import Privacy from "./pages/Privacy";


const RuleDescription = lazy(() => import("./pages/RuleDescription"));
const Translator = lazy(() => import("./pages/Translator"));
const UserFidiaList = lazy(() => import("./pages/UserFidiaList"));
const NewRegister = lazy(() => import("./pages/NewRegister"));
const NewWithdrawals = lazy(() => import("./pages/NewWithdrawals"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const FirstDepositBonus = lazy(() => import("./pages/FirstDepositBonus"));
const SecondDepositBonus = lazy(() => import("./pages/SecondDepositBonus"));
const FirstDepositBonusUSDT = lazy(() => import("./pages/FirstDepositBonusUSDT"));
const SecondDepositBonusUSDT = lazy(() => import("./pages/SecondDepositBonusUSDT"));
const WeeklyDepositBonus = lazy(() => import("./pages/WeeklyDepositBonus"));
const TradeDetails = lazy(() => import("./pages/TradeDetails"));
const UsdtManagement = lazy(() => import("./pages/UsdtManagement"));
const CustomerCare = lazy(() => import("./pages/CustomerCare"));
const UserGain = lazy(() => import("./pages/UserGain"));
const Settings = lazy(() => import("./pages/Settings"));
const Agents = lazy(() => import("./pages/Agents"));
const AdminTafutagamesyauser = lazy(() => import("./pages/AdminTafutagamesyauser"));


// Admin
const AdminBonusManager = lazy(() => import("./pages/AdminBonusManager"));
const Deposit = lazy(() => import("./pages/Deposit"));
const Withdraw = lazy(() => import("./pages/Withdraw"));
const Register = lazy(() => import("./pages/Register"));
const Info = lazy(() => import("./pages/Info"));
const Sports  = lazy(() => import("./pages/Sports"));
const Live  = lazy(() => import("./pages/Live"));
const Casino  = lazy(() => import("./pages/Casino"));
const Virtuals = lazy(() => import("./pages/Virtuals"));
const Aviator = lazy(() => import("./pages/Aviator"));
const CasinoSlots = lazy(() => import("./pages/CasinoSlots"));
const CasinoLockedPreview = lazy(() => import("./pages/CasinoLockedPreview"));



const  LeagueMatches= lazy(() => import("./pages/LeagueMatches"));
const  AllOthersCountry= lazy(() => import("./pages/AllOthersCountry"));
const  AdminVistorDeposit= lazy(() => import("./pages/AdminVistorDeposit"));
const  ViewTeam = lazy(() => import("./pages/ViewTeam"));
const  SubmitWithdraw = lazy(() => import("./pages/SubmitWithdraw"));




const LiveLeague = lazy(() => import("./pages/LiveLeague"));
const SerieA = lazy(() => import("./pages/SerieA"));
const PremierLeague = lazy(() => import("./pages/PremierLeague"));
const Bundesliga = lazy(() => import("./pages/Bundesliga"));
const ChampionsLeague = lazy(() => import("./pages/ChampionsLeague"));
const EuropaLeague = lazy(() => import("./pages/EuropaLeague"));
const ConferenceLeague = lazy(() => import("./pages/ConferenceLeague"));
const CasinoWheell = lazy(() => import("./pages/CasinoWheell"));
const Accounts = lazy(() => import("./pages/Accounts"));
const ConfirmDeposit = lazy(() => import("./pages/ConfirmDeposit"));
const ConfirmDeposits = lazy(() => import("./pages/ConfirmDeposits"));
const VipPage = lazy(() => import("./pages/VipPage"));
const  CasinoLuckySpin = lazy(() => import("./pages/CasinoLuckySpin"));



const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Rules = lazy(() => import("./pages/Rules"));
const ExchangeMoney = lazy(() => import("./pages/ExchangeMoney"));
const AddCard = lazy(() => import("./pages/AddCard"));
const WithdrawRecords = lazy(() => import("./pages/WithdrawRecords"));
const MyTransactions = lazy(() => import("./pages/MyTransactions"));
const NewDeposit = lazy(() => import("./pages/NewDeposit"));
const TotalGain = lazy(() => import("./pages/TotalGain"));
const Records = lazy(() => import("./pages/Records"));
const Record = lazy(() => import("./pages/Record"));
const ParcenalCenter = lazy(() => import("./pages/ParcenalCenter"));
const Announcement = lazy(() => import("./pages/Announcement"));
const MatchList = lazy(() => import("./Components/MatchList"));
const GamesResult = lazy(() => import("./pages/GamesResult"));
const Report = lazy(() => import("./pages/Report"));
const Logout = lazy(() => import("./pages/Logout"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AddMatch = lazy(() => import("./pages/AddMatch"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Commission = lazy(() => import("./pages/Commission"));
const AdminUserBonus = lazy(() => import("./pages/AdminUserBonus"));

const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AgentAddMatches = lazy(() => import("./pages/AgentAddMatches"));
const AgentSearchUser = lazy(() => import("./pages/AgentSearchUser"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const BonusMember = lazy(() => import("./pages/BonusMember"));
const AgentPending = lazy(() => import("./pages/AgentPending"));
const MobileMoney = lazy(() => import("./pages/MobileMoney"));
const TanzaniaDeposit= lazy(() => import("./pages/TanzaniaDeposit"));
const BusinessPayment= lazy(() => import("./pages/BusinessPayment"));
const MobilePayment = lazy(() => import("./pages/MobilePayment"));
const EastafricaDeposit = lazy(() => import("./pages/EastafricaDeposit"));
const  BetPlace  = lazy(() => import("./pages/BetPlace"));
 const  LostRecord  = lazy(() => import("./pages/LostRecord"));
 const  WinRecord  = lazy(() => import("./pages/WinRecord"));
 const  AdminViewsJob  = lazy(() => import("./pages/AdminViewsJob"));
const  TeamBets = lazy(() => import("./pages/TeamBets"));
const  WithdrawByUsdt = lazy(() => import("./pages/WithdrawByUsdt"));

const AdminSecurityWithdraw = lazy(() => import("./pages/AdminSecurityWithdraw"));
const AdminTransactions = lazy(() => import("./pages/AdminTransactions"));
const AdminBetsPayoutLost = lazy(() => import("./pages/AdminBetsPayoutLost"));
const EditMatch = lazy(() => import("./pages/EditMatch"));

const MyBets = lazy(() => import("./pages/MyBets"));
const ActivePlayer = lazy(() => import("./pages/ActivePlayer"));
const Transfer = lazy(() => import("./pages/Transfer"));
const PlinkoGame = lazy(() => import("./pages/PlinkoGame"));


const AdminDuplicateMatches = lazy(() => import("./pages/AdminDuplicateMatches"));
const AgentDuplicateMatches = lazy(() => import("./pages/AgentDuplicateMatches"));
const AdminMatchManager = lazy(() => import("./pages/AdminMatchManager"));
const AdminHistoriayadau = lazy(() => import("./pages/AdminHistoriayadau"));
const AdminManageNumbers = lazy(() => import("./pages/AdminManageNumbers"));
const AdminCommissions = lazy(() => import("./pages/AdminCommissions"));
const AdminBetsRequest = lazy(() => import("./pages/AdminBetsRequest"));
const AdminAddFinalScore = lazy(() => import("./pages/AdminAddFinalScore"));
const AdminBalanceControl = lazy(() => import("./pages/AdminBalanceControl"));
const Adminchekibonus = lazy(() => import("./pages/Adminchekibonus"));
const AgentHistoriayadau = lazy(() => import("./pages/AgentHistoriayadau"));
const AdminHackingMatches = lazy(() => import("./pages/AdminHackingMatches"));
const AdminConvertHistory = lazy(() => import("./pages/AdminConvertHistory"));
const AviatorSpin = lazy(() => import("./pages/AviatorSpin"));
const ResponsibleGaming = lazy(() => import("./pages/ResponsibleGaming"));
const AdminGenerationMatches = lazy(() => import("./pages/AdminGenerationMatches"));
const AdminSweepWallet = lazy(() => import("./pages/AdminSweepWallet"));



const MinesGame = lazy(() => import("./pages/MinesGame"));
const CrashRocket = lazy(() => import("./pages/CrashRocket"));
const DiceRoll = lazy(() => import("./pages/DiceRoll"));
const CardFlip = lazy(() => import("./pages/CardFlip"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Terms = lazy(() => import("./pages/Terms"));
const News = lazy(() => import("./pages/News"));


const AdminFromSofaScore = lazy(() => import("./pages/AdminFromSofaScore"));
const ChangeWithdrawPassword = lazy(() => import("./pages/ChangeWithdrawPassword"));
const ChangeLoginPassword = lazy(() => import("./pages/ChangeLoginPassword"));


const AdminAddScoreOdds = lazy(() => import("./pages/AdminAddScoreOdds"));
const AdminAddVituars = lazy(() => import("./pages/AdminAddVituars"));
const  BetScores= lazy(() => import("./pages/BetScores"));
const  AdminAntScoreRequest= lazy(() => import("./pages/AdminAntScoreRequest"));
const  AdminCorrectScoreRequest= lazy(() => import("./pages/AdminCorrectScoreRequest"));
 
const AdminCommissionHistory = lazy(() => import("./pages/AdminCommissionHistory"));
const AdminDeletedWithdrawHistory = lazy(() => import("./pages/AdminDeletedWithdrawHistory"));
const FutaMaombiYaUondoaji = lazy(() => import("./pages/FutaMaombiYaUondoaji"));
const AdminTeamProfitSearch = lazy(() => import("./pages/AdminTeamProfitSearch"));

const AdminSearchUser = lazy(() => import("./pages/AdminSearchUser"));
const PendingWithdrawals = lazy(() => import("./pages/PendingWithdrawals"));
const AdminUserSearch = lazy(() => import("./pages/AdminUserSearch"));
const AdminUsersMember = lazy(() => import("./pages/AdminUsersMember"));
const AdminExchanges = lazy(() => import("./pages/AdminExchanges"));

const AdminBadilishaMudaWaMatches = lazy(() => import("./pages/AdminBadilishaMudaWaMatches"));

// ================= ROUTE GUARDS =================
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import AgentRoute from "./routes/AgentRoute";
// Create context
export const LanguageContext = createContext();





const AppLoader = () => (
  <div className="app-loader-screen">
    <img src="/images/player.png" className="app-loader-bg" alt="loading" />
    <div className="app-loader-overlay"></div>

    <div className="app-loader-content">
      <div className="app-solar-system">
        <div className="app-orbit app-orbit-one">
          <span className="app-planet-ball">⚽</span>
        </div>

        <div className="app-orbit app-orbit-two">
          <span className="app-planet-ball small">⚽</span>
        </div>

        <div className="app-sun">
          <img src="/favicon.ico" alt="logo" />
        </div>
      </div>

      <p>Loading...</p>
    </div>
  </div>
);



const LayoutWithBottomNav = ({ children }) => {
  const location = useLocation();

  const hideTopBarRoutes = [
    "/login",
    "/menu",
    "/register",
    "/rules",
    "/mypage",
    "/abouts",
    "/info",
    "/withdraw",
    "/submitWithdraw",
    "/casino/card-flip",
    
    
  ];

  const hideBottomNavRoutes = [
    "/login",
    "/menu",
    "/register",
    "/rules",
    "/mypage",
    "/abouts",
    "/info",
     "/aviator",
    "/withdraw",
    "/submitWithdraw",
    "/casino/wheell",
    "/casino/slots",
    "/casino/lucky-spin",
     "/plinko/game",
    
    "/aviator-spin"
    
  ];

  const shouldHideTopBar = hideTopBarRoutes.includes(location.pathname);
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);

  const isLoggedIn = localStorage.getItem("authenticated") === "true";

  return (
    <>
      {!shouldHideTopBar && isLoggedIn && <TopBar />}

      <div
        style={{
          paddingBottom: !shouldHideBottomNav && isLoggedIn ? "70px" : "0",
        }}
      >
        {children}
      </div>

      {!shouldHideBottomNav && isLoggedIn && <BottomNav />}
    </>
  );
};

// ================= APP =================
const App = () => {
  const [language, setLanguage] = useState("en");

  return (
  <BalanceProvider>
  <LanguageContext.Provider value={{ language, setLanguage }}>
    <Router>
      <LayoutWithBottomNav>
<Suspense fallback={<AppLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* USER ROUTES */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <About />
                </PrivateRoute>
              }
            />

 <Route
              path="/betslip"
              element={
                <PrivateRoute>
                  <Betslip/>
                </PrivateRoute>
              }
            />




<Route path="/privacy" element={<Privacy/>} />
<Route path="/News" element={<News/>} />
<Route path="/responsible-gaming" element={<ResponsibleGaming />} />
<Route path="/about-contra-bet-score" element={<AboutContraBetScore />} />
<Route path="/terms" element={<Terms />} />
 <Route path="/cookies" element={<Cookies />} />




<Route
              path="/casino/lucky-spin"
              element={
                <PrivateRoute>
                  <CasinoLuckySpin/>
                </PrivateRoute>
              }
            />


<Route
              path="/casino/free-preview/:id"
              element={
                <PrivateRoute>
                  <CasinoLockedPreview/>
                </PrivateRoute>
              }
            />
<Route
              path="plinko/game"
              element={
                <PrivateRoute>
                  <PlinkoGame/>
                </PrivateRoute>
              }
            />






 <Route
              path="/casino/slots"
              element={
                <PrivateRoute>
                  <CasinoSlots/>
                </PrivateRoute>
              }
            />

<Route
  path="/casino/mines"
  element={
    <PrivateRoute>
      <MinesGame />
    </PrivateRoute>
  }
/>

<Route
  path="/casino/crash-rocket"
  element={
    <PrivateRoute>
      <CrashRocket />
    </PrivateRoute>
  }
/>

<Route
  path="/casino/dice-roll"
  element={
    <PrivateRoute>
      <DiceRoll />
    </PrivateRoute>
  }
/>

<Route
  path="/casino/card-flip"
  element={
    <PrivateRoute>
      <CardFlip />
    </PrivateRoute>
  }
/>
 <Route
              path="/aviator-my-bets"
              element={
                <PrivateRoute>
                  <AviatorMyBets />
                </PrivateRoute>
              }
            />


<Route
  path="/aviator-spin"
  element={
    <PrivateRoute>
      <AviatorSpin />
    </PrivateRoute>
  }
/>

            <Route
              path="/user-refunds"
              element={
                <PrivateRoute>
                  <UserRefunds />
                </PrivateRoute>
              }
            />
<Route path="/total-balance" element={<TotalBalance />} />


<Route path="/successful-deposits" element={<SuccessfulDeposits />} />

  <Route
              path="/aviator-history"
              element={
                <PrivateRoute>
                  <AviatorHistory />
                </PrivateRoute>
              }
            />


  <Route
              path="/other-country-wallet"
              element={
                <PrivateRoute>
                  <OtherCountryWallet />
                </PrivateRoute>
              }
            />


      



 <Route
              path="/change-login-password"
              element={
                <PrivateRoute>
                  <ChangeLoginPassword />
                </PrivateRoute>
              }
            />  



 <Route
              path="/change-withdraw-password"
              element={
                <PrivateRoute>
                  <ChangeWithdrawPassword />
                </PrivateRoute>
              }
            />  



 <Route
              path="/submitWithdraw"
              element={
                <PrivateRoute>
                  <SubmitWithdraw />
                </PrivateRoute>
              }
            /> 





 <Route
              path="/myteam"
              element={
                <PrivateRoute>
                  <ViewTeam />
                </PrivateRoute>
              }
            />



 <Route
              path="/specialgames"
              element={
                <PrivateRoute>
                  <SpecialGames />
              </PrivateRoute>
              }
            />





 <Route
              path="/team-bets"
              element={
                <PrivateRoute>
                  <TeamBets />
                </PrivateRoute>
              }
            />


 <Route
              path="/won-history"
              element={
                <PrivateRoute>
                  <WinRecord />
                </PrivateRoute>
              }
            />






<Route
              path="/lost-history"
              element={
                <PrivateRoute>
                  <LostRecord />
                </PrivateRoute>
              }
            />


            <Route
              path="/mypage"
              element={
                <PrivateRoute>
                  <MyPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />


<Route
              path="/mobile-payment"
              element={
                <PrivateRoute>
                  <MobilePayment />
                </PrivateRoute>
              }
            />



<Route
              path="/mybets"
              element={
                <PrivateRoute>
                  <MyBets />
                </PrivateRoute>
              }
            />




<Route
              path="/all-others-country"
              element={
                <PrivateRoute>
                  <AllOthersCountry/>
                </PrivateRoute>
              }
            />





<Route
              path="/business-payment"
              element={
                <PrivateRoute>
                  <BusinessPayment />
                </PrivateRoute>
              }
            />


<Route
              path="/confirm-deposit"
              element={
                <PrivateRoute>
                  <ConfirmDeposit />
                </PrivateRoute>
              }
            />


<Route
              path="/confirm-deposits"
              element={
                <PrivateRoute>
                  <ConfirmDeposits />
                </PrivateRoute>
              }
            />


            <Route
              path="/eastafrica-deposit"
              element={
                <PrivateRoute>
                  <EastafricaDeposit />
                </PrivateRoute>
              }
            />



<Route path="/abouts" element={<About />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/info" element={<Info />} />
          


<Route path="/sports" element={<Sports />} />
<Route path="/live" element={<Live />} />
<Route path="/casino" element={<Casino />} />
<Route path="/virtuals" element={<Virtuals />} />
<Route path="/aviator" element={<Aviator />} />
<Route path="/league/:leagueName" element={<LeagueMatches />} />





<Route path="/league/live" element={<LiveLeague />} />

<Route path="/league/epl" element={<PremierLeague />} />

<Route path="/league/seriea" element={<SerieA />} />

<Route path="/league/bundesliga" element={<Bundesliga />} />

<Route path="/league/ucl" element={<ChampionsLeague />} />

<Route path="/league/uel" element={<EuropaLeague />} />

<Route path="/league/uecl" element={<ConferenceLeague />} />

<Route path="/casino/wheell" element={<CasinoWheell />} />

            <Route
              path="/announcement"
              element={
                <PrivateRoute>
                  <Announcement />
                </PrivateRoute>
              }
            />

<Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />
            <Route
              path="/parcenalcenter"
              element={
                <PrivateRoute>
                  <ParcenalCenter />
                </PrivateRoute>
              }
            />
            <Route
              path="/ruledescription"
              element={
                <PrivateRoute>
                  <RuleDescription />
                </PrivateRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/marketcards"
              element={
                <PrivateRoute>
                  <MarketCards />
                </PrivateRoute>
              }
            />
            <Route
              path="/aneybonus"
              element={
                <PrivateRoute>
                  <AneyBonus />
                </PrivateRoute>
              }
            />
             <Route
              path="/transfer"
              element={
                <PrivateRoute>
                  <Transfer />
                </PrivateRoute>
              }
            />

             


 <Route
              path="/tanzania-deposit"
              element={
                <PrivateRoute>
                  <TanzaniaDeposit />
                </PrivateRoute>
              }
            />

        


 <Route
              path="/accounts"
              element={
                <PrivateRoute>
                  <Accounts />
                </PrivateRoute>
              }
            />



            <Route
              path="/monthly"
              element={
                <PrivateRoute>
                  <Monthly />
                </PrivateRoute>
              }
            />
            <Route
              path="/invite"
              element={
                <PrivateRoute>
                  <InvertLink/>
                </PrivateRoute>
              }
            />




    <Route
              path="/active-player"
              element={
                <PrivateRoute>
                  <ActivePlayer/>
                </PrivateRoute>
              }
            />






            <Route
              path="/menu"
              element={
                <PrivateRoute>
                  <Menu />
                </PrivateRoute>
              }
            />
            <Route
              path="/eventlist"
              element={
                <PrivateRoute>
                  <EventList />
                </PrivateRoute>
              }
            />
            <Route
              path="/tradelist"
              element={
                <PrivateRoute>
                  <TradeList />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-field"
              element={
                <PrivateRoute>
                  <EditField />
                </PrivateRoute>
              }
            />
            <Route
              path="/games-result"
              element={
                <PrivateRoute>
                  <GamesResult />
                </PrivateRoute>
              }
            />
            <Route
              path="/report"
              element={
                <PrivateRoute>
                  <Report />
                </PrivateRoute>
              }
            />
            <Route
              path="/logout"
              element={
                <PrivateRoute>
                  <Logout />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-gain"
              element={
                <PrivateRoute>
                  <UserGain />
                </PrivateRoute>
              }
            />
            <Route
              path="/totalgain"
              element={
                <PrivateRoute>
                  <TotalGain />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <PrivateRoute>
                  <Agents />
                </PrivateRoute>
              }
            />
            <Route
              path="/TopBar"
              element={
                <PrivateRoute>
                  <TopBar />
                </PrivateRoute>
              }
            />
            <Route
              path="/deposit"
              element={
                <PrivateRoute>
                  <Deposit />
                </PrivateRoute>
              }
            />
            <Route
              path="/withdraw"
              element={
                <PrivateRoute>
                  <Withdraw />
                </PrivateRoute>
              }
            />
            <Route
              path="/team"
              element={
                <PrivateRoute>
                  <Team />
                </PrivateRoute>
              }
            />
 <Route
              path="/commission"
              element={
                <PrivateRoute>
                  <Commission />
                </PrivateRoute>
              }
            />




            <Route
              path="/agent-intro"
              element={
                <PrivateRoute>
                  <AgentIntro />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-card"
              element={
                <PrivateRoute>
                  <AddCard />
                </PrivateRoute>
              }
            />
            <Route
              path="/exchange-money"
              element={
                <PrivateRoute>
                  <ExchangeMoney />
                </PrivateRoute>
              }
            />
            <Route
              path="/records"
              element={
                <PrivateRoute>
                  <Records />
                </PrivateRoute>
              }
            />
            <Route
              path="/record"
              element={
                <PrivateRoute>
                  <Record />
                </PrivateRoute>
              }
            />
            <Route
              path="/WithdrawRecords"
              element={
                <PrivateRoute>
                  <WithdrawRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/NewRegister"
              element={
                <PrivateRoute>
                  <NewRegister />
                </PrivateRoute>
              }
            />
            <Route
              path="/MyTransactions"
              element={
                <PrivateRoute>
                  <MyTransactions />
                </PrivateRoute>
              }
            />


            <Route
              path="/newdeposit"
              element={
                <PrivateRoute>
                  <NewDeposit />
                </PrivateRoute>
              }
            />



<Route
              path="/betscores"
              element={
                <PrivateRoute>
                  <BetScores />
                </PrivateRoute>
              }
            />





  <Route
              path="/mobalimoney"
              element={
                <PrivateRoute>
                  <MobileMoney />
                </PrivateRoute>
              }
            />




            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <Groups />
                </PrivateRoute>
              }
            />

<Route
              path="/rules"
              element={
                <PrivateRoute>
                  <Rules />
                </PrivateRoute>
              }
            />

            <Route
              path="/newwithdrawals"
              element={
                <PrivateRoute>
                  <NewWithdrawals />
                </PrivateRoute>
              }
            />
            <Route
              path="/tradedetails"
              element={
                <PrivateRoute>
                  <TradeDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/PromotionsPage"
              element={
                <PrivateRoute>
                  <PromotionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/FirstDepositBonus"
              element={
                <PrivateRoute>
                  <FirstDepositBonus />
                </PrivateRoute>
              }
            />
            <Route
              path="/SecondDepositBonus"
              element={
                <PrivateRoute>
                  <SecondDepositBonus />
                </PrivateRoute>
              }
            />
            <Route
              path="/FirstDepositBonusUSDT"
              element={
                <PrivateRoute>
                  <FirstDepositBonusUSDT />
                </PrivateRoute>
              }
            />
            <Route
              path="/SecondDepositBonusUSDT"
              element={
                <PrivateRoute>
                  <SecondDepositBonusUSDT />
                </PrivateRoute>
              }
            />

  


           
            <Route
              path="/WeeklyDepositBonus"
              element={
                <PrivateRoute>
                  <WeeklyDepositBonus />
                </PrivateRoute>
              }
            />
            <Route
              path="/usdt-management"
              element={
                <PrivateRoute>
                  <UsdtManagement />
                </PrivateRoute>
              }
            />


  <Route
              path="/withdrawbyusdt"
              element={
                <PrivateRoute>
                  <WithdrawByUsdt />
                </PrivateRoute>
              }
            />


            <Route
              path="/customer-care"
              element={
                <PrivateRoute>
                  <CustomerCare />
                </PrivateRoute>
              }
            />
                    <Route path="/customer-cares" element={<CustomerCare />} />
            <Route
              path="/UserFidiaList"
              element={
                <PrivateRoute>
                  <UserFidiaList />
                </PrivateRoute>
              }
            />
            <Route
              path="/matchlist"
              element={
                <PrivateRoute>
                  <MatchList />
                </PrivateRoute>
              }
            />
            <Route
              path="/translator"
              element={
                <PrivateRoute>
                  <Translator />
                </PrivateRoute>
              }
            />


  <Route
              path="/betplace"
              element={
                <PrivateRoute>
                  <BetPlace />
                </PrivateRoute>
              }
            />

 <Route
              path="/vip-page"
              element={
                <PrivateRoute>
                  <VipPage />
                </PrivateRoute>
              }
            />





























            {/* ADMIN ROUTES */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

 <Route
              path="/admin-generation-matches"
              element={
                <AdminRoute>
                  <AdminGenerationMatches />
                </AdminRoute>
              }
            />



<Route
  path="/agent-dashboard"
  element={
    <AgentRoute>
      <AgentDashboard />
    </AgentRoute>
  }
/>



<Route
  path="/admin-sweep-wallet"
  element={
    <AdminRoute>
      <AdminSweepWallet />
    </AdminRoute>
  }
/>



<Route
              path="/admin-viewsjob"
              element={
                <AdminRoute>
                  <AdminViewsJob/>
                </AdminRoute>
              }
            />


<Route
              path="/Admin-Convert-History"
              element={
                <AdminRoute>
                  <AdminConvertHistory/>
                </AdminRoute>
              }
            />



<Route
              path="/admin-userbonus"
              element={
                <AdminRoute>
                  <AdminUserBonus />
                </AdminRoute>
              }
            />
    <Route
              path="/Admin-From-SofaScore"
              element={
                <AdminRoute>
                  <AdminFromSofaScore />
                </AdminRoute>
              }
            />        


<Route
              path="/admin-view-aviators"
              element={
                <AdminRoute>
                  <AdminViewAviators />
                </AdminRoute>
              }
            />

          

<Route
              path="/admin-tafutagamesyauser"
              element={
                <AdminRoute>
                  <AdminTafutagamesyauser />
                </AdminRoute>
              }
            />




<Route
              path="/Admin-TeamProfitSearch"
              element={
                <AdminRoute>
                  <AdminTeamProfitSearch />
                </AdminRoute>
              }
            />



<Route
              path="/Admin-Add-Vituars"
              element={
                <AdminRoute>
                  <AdminAddVituars />
                </AdminRoute>
              }
            />


<Route
              path="/Admin-HackingMatches"
              element={
                <AdminRoute>
                  <AdminHackingMatches />
                </AdminRoute>
              }
            />
            <Route
              path="/Admin-BadilishaMudaWaMatches"
              element={
                <AdminRoute>
                  <AdminBadilishaMudaWaMatches />
                </AdminRoute>
              }
            />



<Route
              path="/agent-historiayadau"
              element={
                <AgentRoute>
                  <AgentHistoriayadau/>
                </AgentRoute>
              }
            />





<Route
  path="/agent-pending"
  element={
    <PrivateRoute>
      <AgentPending />
    </PrivateRoute>
  }
/>


<Route
  path="/agent-add-matches"
  element={
    <PrivateRoute>
      <AgentAddMatches />
    </PrivateRoute>
  }
/>

<Route
  path="/agent-search-user"
  element={
    <PrivateRoute>
      <AgentSearchUser />
    </PrivateRoute>
  }
/>


            <Route
              path="/admin/add-match"
              element={
                <AdminRoute>
                  <AddMatch />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/admin-users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bonus-member"
              element={
                <AdminRoute>
                  <BonusMember />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/admin-securitywithdraw"
              element={
                <AdminRoute>
                  <AdminSecurityWithdraw />
                </AdminRoute>
              }
            />
            <Route
              path="/Admin-transactions"
              element={
                <AdminRoute>
                  <AdminTransactions />
                </AdminRoute>
              }
            />
            <Route
              path="/Admin-AddFinalScore"
              element={
                <AdminRoute>
                  <AdminAddFinalScore />
                </AdminRoute>
              }
            />


            
<Route
              path="/Admin-BonusManager"
              element={
                <AdminRoute>
                  <AdminBonusManager />
                </AdminRoute>
              }
            />


              <Route
                
                path="/admin-betspayoutlost"
              element={
                <AdminRoute>
                  <AdminBetsPayoutLost />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-usersmember"
              element={
                <AdminRoute>
                  <AdminUsersMember />
                </AdminRoute>
              }
            />




<Route
              path="/Admin-DuplicateMatches"
              element={
                <AdminRoute>
                  <AdminDuplicateMatches />
                </AdminRoute>
              }
            />


<Route
              path="/Admin-VistorDeposit"
              element={
                <AdminRoute>
                  <AdminVistorDeposit/>
                </AdminRoute>
              }
            />


<Route
              path="/agent-DuplicateMatches"
              element={
                <AgentRoute>
                  <AgentDuplicateMatches />
                </AgentRoute>
              }
            />





            <Route
              path="/edit-match/1"
              element={
                <AdminRoute>
                  <EditMatch />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-matchmanager"
              element={
                <AdminRoute>
                  <AdminMatchManager />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-historiayadau"
              element={
                <AdminRoute>
                  <AdminHistoriayadau />
                </AdminRoute>
              }
            />




         
            <Route
              path="/admin-managenumbers"
              element={
                <AdminRoute>
                  <AdminManageNumbers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-commissions"
              element={
                <AdminRoute>
                  <AdminCommissions />
                </AdminRoute>
              }
            />
            <Route
              path="/Admin-BetsRequest"
              element={
                <AdminRoute>
                  <AdminBetsRequest />
                </AdminRoute>
              }
            />
            <Route
              path="/Admin-CommissionHistory"
              element={
                <AdminRoute>
                  <AdminCommissionHistory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-deletedwithdrawhistory"
              element={
                <AdminRoute>
                  <AdminDeletedWithdrawHistory />
                </AdminRoute>
              }
            />
            <Route
              path="/Futa-Maombi-Ya-Uondoaji"
              element={
                <AdminRoute>
                  <FutaMaombiYaUondoaji />
                </AdminRoute>
              }
            />
            <Route
              path="/postertemplate"
              element={
                <AdminRoute>
                  <PosterTemplate />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pending-withdrawals"
              element={
                <AdminRoute>
                  <PendingWithdrawals />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-usersearch"
              element={
                <AdminRoute>
                  <AdminUserSearch />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-exchanges"
              element={
                <AdminRoute>
                  <AdminExchanges />
                </AdminRoute>
              }
            />

  <Route
              path="/Admin-CorrectScoreRequest"
              element={
                <AdminRoute>
                  <AdminCorrectScoreRequest/>
                </AdminRoute>
              }
            />


  <Route
              path="/Admin-AntScoreRequest"
              element={
                <AdminRoute>
                  <AdminAntScoreRequest/>
                </AdminRoute>
              }
            />
          
            <Route
              path="/admin-balance-control"
              element={
                <AdminRoute>
                  <AdminBalanceControl />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-cheki-bonus"
              element={
                <AdminRoute>
                  <Adminchekibonus />
                </AdminRoute>
              }
            />


  <Route path="/betscores/:id" element={<BetScores />} />

            <Route
              path="/Admin-Add-Score-Odds"
              element={
                <AdminRoute>
                  <AdminAddScoreOdds />
                </AdminRoute>
              }
            />


   




            <Route
              path="/AdminSearchUser"
              element={
                <AdminRoute>
                  <AdminSearchUser />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </Suspense>

      </LayoutWithBottomNav>
      </Router>
    </LanguageContext.Provider>
    </BalanceProvider>
  );
};

export default App;