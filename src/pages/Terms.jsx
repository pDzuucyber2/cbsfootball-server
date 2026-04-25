import React, { useState } from "react";
import "./Terms.css";

export default function Terms() {
  const [lang, setLang] = useState("en");

  const t = {
    en: {
      title: "Terms & Conditions",
      intro: "Please read these terms carefully before using our platform.",

      sections: [
        {
          title: "Introduction",
          content: [
            "These Terms form a legal agreement between you and ContractBetScore.",
            "They apply to all betting activities on our platform.",
            "By using our services, you agree to these Terms."
          ]
        },
        {
          title: "User Requirements",
          content: [
            "You must be at least 18 years old.",
            "All information provided must be correct and valid.",
            "You are responsible for your account and activities.",
            "You must comply with all applicable laws in your country."
          ]
        },
        {
          title: "Account Rules",
          content: [
            "Only one account per user is allowed.",
            "Do NOT share your account with anyone.",
            "All transactions are linked to your registered phone number.",
            "Incorrect details may lead to account closure."
          ]
        },
        {
          title: "Deposits & Withdrawals",
          content: [
            "Funds must belong to you.",
            "Withdrawals will be sent to your registered payment method.",
            "Incorrect payment details may delay transactions.",
            "Minimum and maximum limits may apply."
          ]
        },
        {
          title: "Prohibited Activities",
          content: [
            "Cheating, fraud, or manipulation is strictly prohibited.",
            "Using bots, scripts, or hacking tools is not allowed.",
            "Using another person’s payment method is prohibited.",
            "Match fixing or collusion is strictly forbidden."
          ]
        },
        {
          title: "Fraud & Legal Action",
          content: [
            "If you engage in fraud or illegal activities:",
            "Your account will be suspended or permanently closed.",
            "All winnings may be cancelled or confiscated.",
            "Your case may be reported to legal authorities in your country.",
            "Legal action may be taken according to national gaming laws."
          ]
        },
        {
          title: "Responsibility",
          content: [
            "You understand that betting involves risk.",
            "You may lose money and are responsible for your losses.",
            "The platform is for entertainment purposes only."
          ]
        },
        {
          title: "Changes to Terms",
          content: [
            "We may update these Terms at any time.",
            "Changes will be posted on this page.",
            "Continued use means you accept the updated Terms."
          ]
        },
        {
          title: "Support",
          content: [
            "For any issues, contact customer support.",
            "Available via login page, register page, or app menu."
          ]
        }
      ]
    },

    sw: {
      title: "Masharti na Kanuni",
      intro: "Tafadhali soma masharti haya kabla ya kutumia mfumo wetu.",

      sections: [
        {
          title: "Utangulizi",
          content: [
            "Masharti haya ni makubaliano kati yako na ContractBetScore.",
            "Yanatumika kwa shughuli zote za kubashiri.",
            "Kwa kutumia mfumo huu, unakubali masharti haya."
          ]
        },
        {
          title: "Masharti ya Mtumiaji",
          content: [
            "Lazima uwe na umri wa miaka 18 au zaidi.",
            "Taarifa zako lazima ziwe sahihi.",
            "Unawajibika kwa account yako.",
            "Lazima ufuate sheria za nchi yako."
          ]
        },
        {
          title: "Sheria za Account",
          content: [
            "Hairuhusiwi kuwa na account zaidi ya moja.",
            "Usishirikishe account yako na mtu mwingine.",
            "Miamala yote inaunganishwa na namba yako ya simu.",
            "Taarifa zisizo sahihi zinaweza kusababisha kufungwa kwa account."
          ]
        },
        {
          title: "Kuweka na Kutoa Pesa",
          content: [
            "Pesa lazima ziwe zako mwenyewe.",
            "Malipo yatatumwa kwenye njia uliyojisajili.",
            "Makosa ya taarifa yanaweza kuchelewesha malipo.",
            "Kuna viwango vya chini na juu vya kutoa pesa."
          ]
        },
        {
          title: "Vitendo Vilivyokatazwa",
          content: [
            "Udanganyifu au cheating hairuhusiwi.",
            "Matumizi ya bots au hacking ni marufuku.",
            "Kutumia malipo ya mtu mwingine hairuhusiwi.",
            "Match fixing ni kosa kubwa."
          ]
        },
        {
          title: "Udanganyifu na Hatua za Kisheria",
          content: [
            "Ukifanya udanganyifu:",
            "Account yako itafungwa mara moja.",
            "Ushindi wako utaondolewa.",
            "Taarifa zako zinaweza kupelekwa kwa mamlaka za serikali.",
            "Hatua za kisheria zitachukuliwa kulingana na sheria za nchi."
          ]
        },
        {
          title: "Uwajibikaji",
          content: [
            "Kubashiri kuna hatari ya kupoteza pesa.",
            "Unawajibika kwa hasara zako.",
            "Mfumo ni kwa burudani tu."
          ]
        },
        {
          title: "Mabadiliko ya Masharti",
          content: [
            "Tunaweza kubadilisha masharti wakati wowote.",
            "Mabadiliko yatawekwa hapa.",
            "Kuendelea kutumia mfumo ni kukubali mabadiliko."
          ]
        },
        {
          title: "Huduma kwa Wateja",
          content: [
            "Kwa msaada, wasiliana na huduma kwa wateja.",
            "Kupitia login, register au menu."
          ]
        }
      ]
    },

    fr: {
      title: "Termes et Conditions",
      intro: "Veuillez lire ces conditions avant d'utiliser la plateforme.",

      sections: [
        {
          title: "Introduction",
          content: [
            "Ces conditions sont un accord entre vous et ContractBetScore.",
            "Elles s'appliquent à toutes les activités de pari.",
            "En utilisant la plateforme, vous acceptez ces conditions."
          ]
        },
        {
          title: "Conditions Utilisateur",
          content: [
            "Vous devez avoir au moins 18 ans.",
            "Vos informations doivent être correctes.",
            "Vous êtes responsable de votre compte.",
            "Vous devez respecter les lois de votre pays."
          ]
        },
        {
          title: "Règles du Compte",
          content: [
            "Un seul compte par utilisateur.",
            "Ne partagez pas votre compte.",
            "Toutes les transactions sont liées à votre numéro.",
            "Des informations incorrectes peuvent entraîner la fermeture."
          ]
        },
        {
          title: "Dépôts et Retraits",
          content: [
            "Les fonds doivent vous appartenir.",
            "Les retraits vont à votre méthode enregistrée.",
            "Les erreurs peuvent retarder les paiements.",
            "Des limites peuvent s'appliquer."
          ]
        },
        {
          title: "Activités Interdites",
          content: [
            "La fraude est strictement interdite.",
            "Bots et hacking sont interdits.",
            "Utiliser un paiement tiers est interdit.",
            "La manipulation des matchs est interdite."
          ]
        },
        {
          title: "Fraude et Action Légale",
          content: [
            "En cas de fraude:",
            "Votre compte sera suspendu ou fermé.",
            "Les gains seront annulés.",
            "Votre cas peut être signalé aux autorités.",
            "Des actions légales peuvent être prises."
          ]
        },
        {
          title: "Responsabilité",
          content: [
            "Les paris comportent des risques.",
            "Vous êtes responsable de vos pertes.",
            "Plateforme à usage de divertissement."
          ]
        },
        {
          title: "Modifications",
          content: [
            "Nous pouvons modifier ces conditions.",
            "Les changements seront publiés ici.",
            "Continuer à utiliser = accepter."
          ]
        },
        {
          title: "Support",
          content: [
            "Contactez le support pour assistance.",
            "Disponible via menu ou pages de connexion."
          ]
        }
      ]
    }
  };

  return (
    <div className="terms-page">

      {/* LANGUAGE SWITCH */}
      <div className="lang-switch">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("sw")}>SW</button>
        <button onClick={() => setLang("fr")}>FR</button>
      </div>

      <div className="terms-header">
        <h2>{t[lang].title}</h2>
        <p>{t[lang].intro}</p>
      </div>

      <div className="terms-container">
        {t[lang].sections.map((section, index) => (
          <div className="terms-card" key={index}>
            <h3>{section.title}</h3>
            <ul>
              {section.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}