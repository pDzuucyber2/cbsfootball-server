import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div style={containerStyle}>

      {/* 🔥 TOPBAR */}
      <div style={topbarStyle}>
        <Link to="/admin/add-match"><button style={topBtn}>➕ AddMatch</button></Link>
        <Link to="/Admin-DuplicateMatches"><button style={topBtn}>📅 Today</button></Link>
        <Link to="/Admin-DuplicateMatches"><button style={topBtn}>📆 Tomorrow</button></Link>
        <Link to="/Admin-BadilishaMudaWaMatches"><button style={topBtn}>⏰ Time</button></Link>
        <Link to="/Admin-AntScoreRequest"><button style={topBtn}>⚽ AntScore</button></Link>
        <Link to="/Admin-CorrectScoreRequest"><button style={topBtn}>🎯 CorrectScore</button></Link>
        <Link to="/admin-view-aviators"><button style={topBtn}>✈️ Aviator</button></Link>
        <Link to="/Admin-Add-Vituars"><button style={topBtn}>🎮 Vituars</button></Link>
        <Link to="/Admin-AddFinalScore"><button style={topBtn}>🏁 FinalScore</button></Link>
        <Link to="/Admin-Add-Score-Odds"><button style={topBtn}>📊 ScoreOdds</button></Link>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Dashboard</h2>

      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Karibu kwenye sehemu ya admin. Chagua shughuli unayotaka kufanya:
      </p>

      <div style={gridWrapperStyle}>
        <div style={gridStyle}>

          <Link to="/admin/admin-securitywithdraw"><button style={buttonStyle}>🔐 Security Withdraw</button></Link>
          <Link to="/admin/add-match"><button style={buttonStyle}>➕ Add Match</button></Link>
          <Link to="/admin/bonus-member"><button style={buttonStyle}>🎁 Bonus Member</button></Link>
          <Link to="/Admin-BonusManager"><button style={buttonStyle}>🎁 Futa Bonus</button></Link>
          <Link to="/Admin-TeamProfitSearch"><button style={buttonStyle}>Kaguwa usahii wa commission</button></Link>
          <Link to="/Admin-VistorDeposit"><button style={buttonStyle}>AdminVistorDeposi</button></Link>
          <Link to="/Admin-Add-Vituars"><button style={buttonStyle}>AdminAddVituars</button></Link>
          <Link to="/admin-view-aviators"><button style={buttonStyle}>AdminViewAviators</button></Link>

          <Link to="/admin-transactions"><button style={buttonStyle}>🔄 Transactions</button></Link>
          <Link to="/admin-livechats"><button style={buttonStyle}>💬 Livechats</button></Link>
          <Link to="/admin-betspayoutlost"><button style={buttonStyle}>❌ Bets Payout Lost</button></Link>
          <Link to="/admin-tafutagamesyauser"><button style={buttonStyle}>Tafutagamesyauser</button></Link>

          <Link to="/admin-viewsjob"><button style={buttonStyle}>✏️AdminViewsJob</button></Link>
          <Link to="/edit-match/1"><button style={buttonStyle}>✏️ Edit Match</button></Link>
          <Link to="/admin-matchmanager"><button style={buttonStyle}>🛠️ Match ManagerAdd ok ediot</button></Link>
          <Link to="/admin-historiayadau"><button style={buttonStyle}>📜 Kagua Miamala ya watumiaji</button></Link>

          <Link to="/admin-managenumbers"><button style={buttonStyle}>🔢 Manage Numbers</button></Link>
          <Link to="/admin-commissions"><button style={buttonStyle}>👛 Commissions</button></Link>
          <Link to="/Admin-CorrectScoreRequest"><button style={buttonStyle}>⚖️CorrectScoreRequesit</button></Link>
          <Link to="/Admin-AntScoreRequest"><button style={buttonStyle}>⚖️AntScoreRequesit</button></Link>
          <Link to="/admin-commissionhistory"><button style={buttonStyle}>📊 Commission History</button></Link>
          <Link to="/admin-deletedwithdrawhistory"><button style={buttonStyle}>🗑️ Deleted Deposit</button></Link>
          <Link to="/Futa-Maombi-Ya-Uondoaji"><button style={buttonStyle}>🧹 Futa Maombi</button></Link>

          <Link to="/match-list"><button style={buttonStyle}>📋 Match List</button></Link>
          <Link to="/admin-withdrawalpanel"><button style={buttonStyle}>💵 Withdrawal Panel</button></Link>
          <Link to="/adminwithdrawal"><button style={buttonStyle}>💸 Withdraw</button></Link>
          <Link to="/AdminSearchUser"><button style={buttonStyle}>💸 HackingPhone</button></Link>
          <Link to="/Admin-BadilishaMudaWaMatches"><button style={buttonStyle}>BadilishaMudaWaMatches</button></Link>
          <Link to="/Admin-Convert-History"><button style={buttonStyle}>👁️AdminConvertHistory</button></Link>
           <Link to="/admin-generation-matches"><button style={buttonStyle}>AdminGenerationMatches</button></Link>



          <Link to="/admin/pending-withdrawals"><button style={buttonStyle}>⏳ Pending</button></Link>
          <Link to="/admin-usersearch"><button style={buttonStyle}>🔍 User Search</button></Link>
          <Link to="/Admin-AddFinalScore"><button style={buttonStyle}>🎧 AdminAddFinalScore</button></Link>
          <Link to="/Admin-HackingMatches"><button style={buttonStyle}>👽Admin-HackingMatches</button></Link>
          <Link to="/Admin-From-SofaScore"><button style={buttonStyle}>👽AdminFromSofaScore</button></Link>

          <Link to="/admin/admin-users"><button style={buttonStyle}>👥 Admin Users</button></Link>
          <Link to="/admin-usersmember"><button style={buttonStyle}>👥 Users Member</button></Link>
          <Link to="/admin-exchanges"><button style={buttonStyle}>AdminExchanges</button></Link>
          <Link to="/postertemplate"><button style={buttonStyle}>PosterTemplate</button></Link>
          <Link to="/admin-balance-control"><button style={buttonStyle}>AdminBalanceControl</button></Link>
          <Link to="/admin-cheki-bonus"><button style={buttonStyle}>Kagua bonus</button></Link>
          <Link to="/Admin-Add-Score-Odds"><button style={buttonStyle}>AdminAddScoreOdds</button></Link>
          <Link to="/Admin-UserBonus"><button style={buttonStyle}>AdminUserBonus</button></Link>
          <Link to="/Admin-DuplicateMatches"><button style={buttonStyle}>Today/Tommorrow/Time</button></Link>
          <Link to="/admin-sweep-wallet"><button style={buttonStyle}>AdminSweepWallet</button></Link>
          <Link to="/admin/refresh-matches"><button style={buttonStyle}>AdminRefrashMatchesByServer</button></Link>
        

        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: '20px',
  maxWidth: '100%',
  margin: '0 auto'
};

const gridWrapperStyle = {
  overflowX: 'auto',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
  gap: '15px',
  minWidth: '600px'
};

const buttonStyle = {
  padding: '12px 15px',
  fontSize: '16px',
  backgroundColor: '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  transition: 'background 0.3s ease'
};

/* 🔥 TOPBAR STYLE */
const topbarStyle = {
  display: "flex",
  gap: "10px",
  overflowX: "auto",
  padding: "10px",
  marginBottom: "15px",
  background: "#111",
  borderRadius: "10px"
};

const topBtn = {
  whiteSpace: "nowrap",
  padding: "8px 12px",
  fontSize: "14px",
  background: "#ff9800",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default AdminDashboard;