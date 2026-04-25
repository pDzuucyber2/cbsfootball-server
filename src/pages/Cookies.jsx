import React, { useState } from "react";
import "./Cookies.css";

export default function Cookies() {
  const [lang, setLang] = useState("en");
  const [open, setOpen] = useState("intro");

  const toggle = (section) => {
    setOpen((prev) => (prev === section ? "" : section));
  };

  const t = {
    en: {
      title: "Cookies Policy",
      subtitle: "ContractBetScore Cookies & Tracking Policy",

      intro: [
        "When you visit or use ContractBetScore platform (website or mobile app), we use cookies and tracking technologies.",
        "These technologies help improve your experience, security, and platform performance."
      ],

      what: [
        "Cookies are small text files stored on your device.",
        "They help remember login sessions and preferences.",
        "They improve performance and user experience.",
        "Cookies do NOT harm your device."
      ],

      why: [
        "Account & Authentication: keep you logged in and secure",
        "Performance & Analytics: improve system and user experience",
        "Functionality: remember settings like language",
        "Marketing: show bonuses and promotions",
        "Security: detect fraud and protect accounts"
      ],

      types: [
        "Strictly Necessary Cookies: required for system operation",
        "Functionality Cookies: remember user preferences",
        "Performance Cookies: analyze usage and improve platform",
        "Marketing Cookies: personalized ads and promotions",
        "Security Cookies: fraud detection and protection"
      ],

      third: [
        "We may use third-party services like Google Analytics and advertising networks.",
        "These providers may collect usage data under their own privacy policies."
      ],

      control: [
        "You can manage cookies through your browser settings.",
        "You can delete, block or allow cookies anytime.",
        "Disabling cookies may affect platform functionality."
      ],

      security: [
        "You are responsible for securing your account.",
        "Do NOT share your login details.",
        "Always logout from shared devices.",
        "Use strong passwords and withdrawal PIN."
      ],

      fraud: [
        "Fraud, cheating, manipulation or abuse is strictly prohibited.",
        "If detected:",
        "Your account will be suspended or permanently closed",
        "Winnings may be cancelled or forfeited",
        "Account may be investigated",
        "Cases may be reported to legal authorities under gaming laws of your country."
      ],

      legal: [
        "We comply with gaming and data protection laws in all supported regions."
      ],

      contact: [
        "Contact support via app menu, login page or register page."
      ]
    },

    sw: {
      title: "Sera za Cookies",
      subtitle: "Sera ya Cookies na Tracking ya ContractBetScore",

      intro: [
        "Unapotumia ContractBetScore (website au app), tunatumia cookies na teknolojia za tracking.",
        "Hizi zinasaidia kuboresha matumizi, usalama na ufanisi wa mfumo."
      ],

      what: [
        "Cookies ni mafaili madogo yanayohifadhiwa kwenye kifaa chako.",
        "Husaidia kukumbuka login na settings zako.",
        "Huboresha matumizi ya mfumo.",
        "Hazidhuru kifaa chako."
      ],

      why: [
        "Akaunti & Usalama: kukuweka logged in salama",
        "Uchambuzi: kuboresha mfumo",
        "Functionality: kukumbuka settings",
        "Matangazo: bonuses na promos",
        "Usalama: kugundua udanganyifu"
      ],

      types: [
        "Cookies Muhimu: mfumo kufanya kazi",
        "Cookies za Functionality: kukumbuka mapendeleo",
        "Cookies za Performance: uchambuzi wa matumizi",
        "Cookies za Marketing: promos na matangazo",
        "Cookies za Usalama: ulinzi wa akaunti"
      ],

      third: [
        "Tunaweza kutumia huduma za watu wa tatu kama Google Analytics.",
        "Hawa wana sera zao za faragha."
      ],

      control: [
        "Unaweza kudhibiti cookies kupitia browser.",
        "Unaweza kufuta au kuzuia cookies.",
        "Kuzima cookies kunaweza kuathiri mfumo."
      ],

      security: [
        "Wewe unawajibika kulinda akaunti yako.",
        "Usishare password yako.",
        "Logout kwenye vifaa vya pamoja.",
        "Tumia password imara na withdrawal PIN."
      ],

      fraud: [
        "Udanganyifu au cheating ni marufuku.",
        "Ukigundulika:",
        "Akaunti itafungwa au kusimamishwa",
        "Mapato yanaweza kufutwa",
        "Kesi inaweza kuchunguzwa",
        "Inaweza kupelekwa kwa vyombo vya sheria kulingana na sheria za gaming za nchi yako."
      ],

      legal: [
        "Tunazingatia sheria za gaming na data protection."
      ],

      contact: [
        "Wasiliana na customer support kupitia app au login page."
      ]
    },

    fr: {
      title: "Politique des Cookies",
      subtitle: "Politique Cookies ContractBetScore",

      intro: [
        "Lorsque vous utilisez ContractBetScore, nous utilisons des cookies et technologies de suivi.",
        "Ils améliorent l’expérience, la sécurité et les performances."
      ],

      what: [
        "Les cookies sont des petits fichiers stockés sur votre appareil.",
        "Ils mémorisent vos connexions et préférences.",
        "Ils améliorent les performances.",
        "Ils ne nuisent pas à votre appareil."
      ],

      why: [
        "Compte & Authentification: connexion sécurisée",
        "Performance: amélioration du système",
        "Fonctionnalité: mémorisation des paramètres",
        "Marketing: promotions personnalisées",
        "Sécurité: détection de fraude"
      ],

      types: [
        "Cookies essentiels: fonctionnement du système",
        "Cookies fonctionnels: préférences utilisateur",
        "Cookies de performance: analyse",
        "Cookies marketing: publicité",
        "Cookies sécurité: protection contre fraude"
      ],

      third: [
        "Nous utilisons des services tiers comme Google Analytics.",
        "Ils appliquent leurs propres politiques."
      ],

      control: [
        "Vous pouvez gérer les cookies via votre navigateur.",
        "Vous pouvez supprimer ou bloquer les cookies.",
        "La désactivation peut affecter le site."
      ],

      security: [
        "Vous êtes responsable de la sécurité de votre compte.",
        "Ne partagez pas vos identifiants.",
        "Déconnectez-vous sur appareils partagés.",
        "Utilisez un mot de passe fort et PIN de retrait."
      ],

      fraud: [
        "La fraude est strictement interdite.",
        "En cas de fraude:",
        "Compte suspendu ou fermé",
        "Gains annulés",
        "Enquête possible",
        "Peut être signalé aux autorités selon les lois de jeu."
      ],

      legal: [
        "Nous respectons les lois de jeu et protection des données."
      ],

      contact: [
        "Contactez le support via l’application ou page de connexion."
      ]
    }
  };

  const d = t[lang];

  return (
    <div className="cookies-page">
      <div className="lang-switch">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("sw")}>SW</button>
        <button onClick={() => setLang("fr")}>FR</button>
      </div>

      <h2>{d.title}</h2>
      <p>{d.subtitle}</p>

      <div className="cookie-card">
        <button onClick={() => toggle("intro")}>Introduction</button>
        {open === "intro" && (
          <ul>
            {d.intro.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("what")}>What Are Cookies?</button>
        {open === "what" && (
          <ul>
            {d.what.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("why")}>Why We Use Cookies</button>
        {open === "why" && (
          <ul>
            {d.why.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("types")}>Types of Cookies</button>
        {open === "types" && (
          <ul>
            {d.types.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("third")}>Third Party Cookies</button>
        {open === "third" && (
          <ul>
            {d.third.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("control")}>Cookie Control</button>
        {open === "control" && (
          <ul>
            {d.control.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card warning">
        <button onClick={() => toggle("security")}>Account Security</button>
        {open === "security" && (
          <ul>
            {d.security.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card warning">
        <button onClick={() => toggle("fraud")}>Fraud Warning</button>
        {open === "fraud" && (
          <ul>
            {d.fraud.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("legal")}>Legal Compliance</button>
        {open === "legal" && (
          <ul>
            {d.legal.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="cookie-card">
        <button onClick={() => toggle("contact")}>Contact</button>
        {open === "contact" && (
          <ul>
            {d.contact.map((i, x) => (
              <li key={x}>{i}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}