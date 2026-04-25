import React, { useState } from "react";
import "./Privacy.css";

export default function Privacy() {
  const [lang, setLang] = useState("en");
  const [open, setOpen] = useState(true);

  const t = {
    en: {
      title: "Privacy Policy",
      subtitle: "Please read carefully before using the platform.",

      sections: {
        info: "1. Information We Collect",
        infoText: [
          "Username and password",
          "Full name and phone number",
          "Security questions and answers",
          "Payment wallet details",
          "Device and usage information"
        ],

        use: "2. How We Use Your Information",
        useText: [
          "Account creation and management",
          "Withdrawal and deposit processing",
          "Security verification",
          "Fraud prevention and system protection",
          "Customer support services"
        ],

        protection: "3. Data Protection",
        protectionText: [
          "We use strong security systems to protect your data.",
          "However, users are also responsible for keeping their login details confidential."
        ],

        security: "4. Account Responsibility & Security",
        securityText: [
          "You must NOT share your account with anyone",
          "You are fully responsible for all activities on your account",
          "You must set a secure withdrawal PIN",
          "You must keep your login details safe at all times"
        ],

        fraud: "5. Fraud & Illegal Activities (IMPORTANT)",
        fraudText: [
          "Any form of fraud, cheating, manipulation, or platform abuse is strictly prohibited.",
          "If you are found engaging in fraudulent activities:",
          "Your account will be immediately suspended or permanently closed",
          "All winnings may be cancelled or forfeited",
          "Your account details may be reviewed for investigation",
          "The platform reserves the right to take further action",
          "In cases of serious fraud or illegal activity, your case may be reported to the relevant legal authorities in your country, and may be handled in accordance with applicable gaming laws and national regulations."
        ],

        legal: "6. Legal Compliance",
        legalText: [
          "We operate under applicable gaming and data protection laws in the jurisdictions where our services are offered."
        ],

        contact: "7. Contact Support",
        contactText: [
          "For any issues regarding your account, please contact customer support via the app menu, login page, or register page."
        ]
      }
    },

    sw: {
      title: "Sera za Faragha",
      subtitle: "Tafadhali soma kwa makini kabla ya kutumia mfumo.",

      sections: {
        info: "1. Taarifa Tunazokusanya",
        infoText: [
          "Username na password",
          "Jina kamili na namba ya simu",
          "Maswali na majibu ya usalama",
          "Taarifa za wallet ya malipo",
          "Taarifa za kifaa na matumizi"
        ],

        use: "2. Tunatumiaje Taarifa Zako",
        useText: [
          "Kuunda na kusimamia akaunti",
          "Kuchakata kutoa na kuweka pesa",
          "Uthibitisho wa usalama",
          "Kuzuia udanganyifu na kulinda mfumo",
          "Huduma kwa wateja"
        ],

        protection: "3. Ulinzi wa Data",
        protectionText: [
          "Tunatumia mifumo imara ya usalama kulinda taarifa zako.",
          "Lakini mtumiaji anawajibika pia kuhifadhi taarifa zake za kuingia kwa siri."
        ],

        security: "4. Jukumu la Akaunti & Usalama",
        securityText: [
          "Hauruhusiwi kushare akaunti yako na mtu yeyote",
          "Wewe ndiye unawajibika kwa shughuli zote za akaunti yako",
          "Lazima uweke withdrawal PIN salama",
          "Lazima uhifadhi taarifa zako za kuingia kwa usiri wa hali ya juu"
        ],

        fraud: "5. Udanganyifu & Matendo Haramu (MUHIMU)",
        fraudText: [
          "Aina yoyote ya udanganyifu, cheating au matumizi mabaya ya mfumo ni marufuku.",
          "Ukikamatwa ukijihusisha na udanganyifu:",
          "Akaunti yako itafungwa mara moja au milele",
          "Mshindi au faida zote zinaweza kufutwa",
          "Taarifa zako zinaweza kuchunguzwa",
          "Jukwaa lina haki ya kuchukua hatua zaidi",
          "Kama ni udanganyifu mkubwa au kinyume cha sheria, kesi yako inaweza kupelekwa kwa vyombo vya sheria vya nchi yako kulingana na sheria za gaming na kanuni za kitaifa."
        ],

        legal: "6. Uzingatiaji wa Sheria",
        legalText: [
          "Tunafanya kazi chini ya sheria za gaming na ulinzi wa data katika nchi tunazotoa huduma."
        ],

        contact: "7. Huduma kwa Wateja",
        contactText: [
          "Kwa matatizo ya akaunti yako wasiliana na huduma kwa wateja kupitia menu ya app, login au register page."
        ]
      }
    },

    fr: {
      title: "Politique de Confidentialité",
      subtitle: "Veuillez lire attentivement avant d'utiliser la plateforme.",

      sections: {
        info: "1. Informations Collectées",
        infoText: [
          "Nom d'utilisateur et mot de passe",
          "Nom complet et numéro de téléphone",
          "Questions et réponses de sécurité",
          "Détails du portefeuille de paiement",
          "Informations sur l'appareil et l'utilisation"
        ],

        use: "2. Utilisation des Informations",
        useText: [
          "Création et gestion de compte",
          "Traitement des dépôts et retraits",
          "Vérification de sécurité",
          "Prévention de fraude et protection du système",
          "Service client"
        ],

        protection: "3. Protection des Données",
        protectionText: [
          "Nous utilisons des systèmes de sécurité avancés pour protéger vos données.",
          "Cependant, les utilisateurs sont responsables de la confidentialité de leurs identifiants."
        ],

        security: "4. Responsabilité du Compte & Sécurité",
        securityText: [
          "Vous ne devez PAS partager votre compte",
          "Vous êtes entièrement responsable de votre compte",
          "Vous devez définir un code PIN de retrait sécurisé",
          "Vous devez garder vos identifiants confidentiels"
        ],

        fraud: "5. Fraude & Activités Illégales (IMPORTANT)",
        fraudText: [
          "Toute fraude, triche ou abus de plateforme est strictement interdit.",
          "Si vous êtes impliqué dans une fraude:",
          "Votre compte sera suspendu ou fermé définitivement",
          "Les gains peuvent être annulés",
          "Votre compte peut être analysé pour enquête",
          "La plateforme peut prendre d'autres mesures",
          "En cas de fraude grave, votre dossier peut être transmis aux autorités légales de votre pays conformément aux lois de jeu et réglementations nationales."
        ],

        legal: "6. Conformité Légale",
        legalText: [
          "Nous opérons selon les lois de jeu et de protection des données applicables dans les juridictions où nous offrons nos services."
        ],

        contact: "7. Support Client",
        contactText: [
          "Pour tout problème de compte, contactez le support via le menu de l'application, la page de connexion ou d'inscription."
        ]
      }
    }
  };

  const data = t[lang];

  return (
    <div className="privacy-page">

      {/* LANGUAGE SWITCH */}
      <div className="lang-switch">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("sw")}>SW</button>
        <button onClick={() => setLang("fr")}>FR</button>
      </div>

      <div className="rules-header">
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
      </div>

      {/* INFO */}
      <div className="rule-card">
        <h3>{data.sections.info}</h3>
        <ul>{data.sections.infoText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* USE */}
      <div className="rule-card">
        <h3>{data.sections.use}</h3>
        <ul>{data.sections.useText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* PROTECTION */}
      <div className="rule-card">
        <h3>{data.sections.protection}</h3>
        <ul>{data.sections.protectionText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* SECURITY */}
      <div className="rule-card warning-card">
        <h3>{data.sections.security}</h3>
        <ul>{data.sections.securityText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* FRAUD */}
      <div className="rule-card warning-card">
        <h3>{data.sections.fraud}</h3>
        <ul>{data.sections.fraudText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* LEGAL */}
      <div className="rule-card">
        <h3>{data.sections.legal}</h3>
        <ul>{data.sections.legalText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

      {/* CONTACT */}
      <div className="rule-card">
        <h3>{data.sections.contact}</h3>
        <ul>{data.sections.contactText.map((i, x) => <li key={x}>{i}</li>)}</ul>
      </div>

    </div>
  );
}