import React, { useState } from "react";
import "./Rule.css";

export default function Rule() {
  const [openSection, setOpenSection] = useState("general");
  const [lang, setLang] = useState("en");

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  const t = {
    en: {
      title: "Sports Betting Rules",
      subtitle: "Please read carefully before placing any bet.",
      security: "Account & Security",
      support: "Customer Support",
      referral: "Bonus & Referral",
      securityText: [
        "Do NOT share your account or personal details with anyone.",
        "You are fully responsible for your account security.",
        "Set your withdraw PIN to protect your funds.",
        "Add your payment wallet details correctly for secure withdrawals.",
        "You can withdraw only after completing your account settings.",
        "You must play at least 3 games before making a withdrawal.",
        "Minimum withdrawal is 10,000 and maximum is 5,000,000.",
        "Daily maximum withdrawal limit is 25,000,000.",
        "Your account includes: username, password, security question, real name, and registered phone number.",
        "If you lose money due to your own mistake, the platform is not responsible."
      ],
      supportText: [
        "If you forget your withdraw PIN or login password, contact customer support.",
        "Support is available from Login, Register or Menu page.",
        "Do NOT create new account before contacting support.",
        "Provide correct account details for fast help."
      ],
      referralText: [
        "To share your link and earn bonus, go to Menu.",
        "Then select Agent section.",
        "Copy your Invite Link and share with others.",
        "You earn bonus when users register using your link."
      ]
    },

    sw: {
      title: "Sheria za Kubashiri",
      subtitle: "Tafadhali soma kwa makini kabla ya kuweka bet.",
      security: "Usalama wa Account",
      support: "Huduma kwa Wateja",
      referral: "Bonus na Invite",
      securityText: [
        "Hairuhusiwi kushare account au taarifa zako kwa mtu yeyote.",
        "Wewe ndiye mwenye jukumu la usalama wa account yako.",
        "Weka withdraw PIN kulinda pesa zako.",
        "Ongeza wallet zako zote kwa usahihi ili kulinda account yako.",
        "Unaweza kutoa pesa baada ya kujaza taarifa zako zote za setting.",
        "Lazima ucheze angalau michezo 3 kabla ya kutoa pesa.",
        "Kiwango cha chini cha kutoa ni 10,000 na juu ni 5,000,000.",
        "Unaweza kutoa hadi 25,000,000 kwa siku.",
        "Account yako ina: username, password, security question, jina halisi na namba ya simu.",
        "Ukipoteza pesa kwa uzembe wako, jukwa halitawajibika."
      ],
      supportText: [
        "Ukisahau PIN ya kutoa au password ya login, wasiliana na huduma kwa wateja.",
        "Huduma inapatikana kwenye Login, Register au Menu.",
        "Usifungue account mpya kabla ya kuwasiliana na support.",
        "Toa taarifa sahihi za account yako kupata msaada haraka."
      ],
      referralText: [
        "Ili kushare link na kupata bonus, ingia Menu.",
        "Kisha chagua Agent.",
        "Nakili Invite Link yako na ishirikishe kwa wengine.",
        "Unapata bonus watu wakijiandikisha kupitia link yako."
      ]
    },

    fr: {
      title: "Règles de Paris Sportifs",
      subtitle: "Veuillez lire attentivement avant de parier.",
      security: "Sécurité du Compte",
      support: "Service Client",
      referral: "Bonus & Parrainage",
      securityText: [
        "Ne partagez pas votre compte ou vos informations personnelles.",
        "Vous êtes responsable de la sécurité de votre compte.",
        "Définissez un code PIN de retrait pour protéger vos fonds.",
        "Ajoutez correctement vos portefeuilles de paiement.",
        "Le retrait est possible après avoir complété les paramètres du compte.",
        "Vous devez jouer au moins 3 jeux avant de retirer.",
        "Retrait minimum 10,000 et maximum 5,000,000.",
        "Limite quotidienne de retrait: 25,000,000.",
        "Votre compte inclut: nom d'utilisateur, mot de passe, question de sécurité, nom réel et numéro.",
        "La plateforme n'est pas responsable des pertes dues à vos erreurs."
      ],
      supportText: [
        "Si vous oubliez votre PIN ou mot de passe, contactez le support client.",
        "Support disponible via Login, Register ou Menu.",
        "Ne créez pas un nouveau compte avant de contacter le support.",
        "Fournissez les bonnes informations pour une aide rapide."
      ],
      referralText: [
        "Pour partager votre lien et gagner un bonus, allez dans Menu.",
        "Ensuite sélectionnez Agent.",
        "Copiez votre lien d’invitation et partagez-le.",
        "Vous gagnez un bonus lorsque des utilisateurs s’inscrivent avec votre lien."
      ]
    }
  };

  return (
    <div className="rules-page">

      {/* LANGUAGE SWITCH */}
      <div className="lang-switch">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("sw")}>SW</button>
        <button onClick={() => setLang("fr")}>FR</button>
      </div>

      <div className="rules-header">
        <h2>{t[lang].title}</h2>
        <p>{t[lang].subtitle}</p>
      </div>

      <div className="rules-container">

        {/* SECURITY */}
        <div className="rule-card warning-card">
          <button className="rule-title" onClick={() => toggleSection("security")}>
            <span>{t[lang].security}</span>
            <span>{openSection === "security" ? "−" : "+"}</span>
          </button>

          {openSection === "security" && (
            <div className="rule-content">
              <ul>
                {t[lang].securityText.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SUPPORT */}
        <div className="rule-card">
          <button className="rule-title" onClick={() => toggleSection("support")}>
            <span>{t[lang].support}</span>
            <span>{openSection === "support" ? "−" : "+"}</span>
          </button>

          {openSection === "support" && (
            <div className="rule-content">
              <ul>
                {t[lang].supportText.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* REFERRAL */}
        <div className="rule-card">
          <button className="rule-title" onClick={() => toggleSection("referral")}>
            <span>{t[lang].referral}</span>
            <span>{openSection === "referral" ? "−" : "+"}</span>
          </button>

          {openSection === "referral" && (
            <div className="rule-content">
              <ul>
                {t[lang].referralText.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}