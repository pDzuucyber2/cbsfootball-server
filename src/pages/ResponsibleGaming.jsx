import React, { useMemo, useState } from "react";
import "./ResponsibleGaming.css";

export default function ResponsibleGaming() {
  const [openSection, setOpenSection] = useState("intro");
  const [lang, setLang] = useState("en");

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  const t = {
    en: {
      title: "Responsible Gambling",
      subtitle:
        "We believe in betting responsibly. Stay in control and only bet what you can afford.",

      intro: "Introduction",
      introText: [
        "We encourage all users to enjoy betting as a form of entertainment, not as a source of income.",
        "Always stay in control of your betting habits and only use money you can afford to lose.",
        "If betting becomes a problem, please contact our support team for help."
      ],

      control: "Maintaining Control",
      controlText: [
        "Treat gambling as entertainment, not income.",
        "Accept that gambling is based on chance.",
        "Do not let betting affect your daily life or responsibilities.",
        "Avoid betting under stress or alcohol influence.",
        "Set daily or weekly limits for deposits.",
        "Never chase your losses.",
        "Take breaks and monitor your activity."
      ],

      monitor: "Monitor Your Activity",
      monitorText: [
        "Regularly check your account statements.",
        "Track deposits, withdrawals and betting history.",
        "If you notice problems, take action immediately."
      ],

      warning: "Warning Signs",
      warningText: [
        "Betting more than you can afford.",
        "Borrowing or stealing money to gamble.",
        "Neglecting food, sleep or responsibilities.",
        "Hiding your betting habits.",
        "Feeling unable to stop gambling.",
        "Others saying you may have a gambling problem."
      ],

      self: "Self-Exclusion",
      selfText: [
        "Self-exclusion allows you to close your account temporarily or permanently.",
        "Temporary exclusion blocks access for a period of time.",
        "Permanent exclusion means you cannot access your account again.",
        "Do not attempt to bypass restrictions."
      ],

      underage: "Underage Gambling",
      underageText: [
        "You must be 18 years or older to use this platform.",
        "We may verify your age at any time.",
        "If underage, your account will be closed and winnings may be forfeited."
      ],

      fraud: "Fraud & Legal Action",
      fraudText: [
        "Fraud, cheating, or manipulation is strictly prohibited.",
        "Accounts involved in fraud may be suspended or permanently closed.",
        "Winnings may be cancelled.",
        "Serious cases may be reported to legal authorities according to national gaming laws."
      ],

      support: "Get Help",
      supportText: [
        "If you feel gambling is becoming a problem, contact support.",
        "You can also seek independent counselling services.",
        "We are here to help you stay in control."
      ]
    },

    sw: {
      title: "Uwajibikaji wa Kubashiri",
      subtitle:
        "Tunasisitiza kubeti kwa uwajibikaji. Dhibiti matumizi yako na tumia pesa unazoweza kupoteza.",

      intro: "Utangulizi",
      introText: [
        "Tunawahimiza watumiaji kubeti kama burudani, sio chanzo cha kipato.",
        "Dhibiti matumizi yako ya betting kila wakati na tumia pesa unazoweza kupoteza.",
        "Ikiwa betting inakuwa tatizo, wasiliana na huduma kwa wateja."
      ],

      control: "Kudhibiti Matumizi",
      controlText: [
        "Chukulia betting kama burudani, sio kipato.",
        "Tambua kuwa betting ni mchezo wa bahati.",
        "Usiruhusu kuathiri maisha ya kila siku au majukumu yako.",
        "Epuka kubeti ukiwa na stress au umelewa.",
        "Weka mipaka ya kila siku au kila wiki.",
        "Usifuatilie hasara.",
        "Pumzika na fuatilia matumizi yako."
      ],

      monitor: "Fuatilia Matumizi",
      monitorText: [
        "Angalia taarifa za account yako mara kwa mara.",
        "Fuatilia deposit, withdrawal na betting history.",
        "Ukiona tatizo, chukua hatua mapema."
      ],

      warning: "Dalili za Tatizo",
      warningText: [
        "Kubeti zaidi ya uwezo wako.",
        "Kukopa au kuiba ili kubeti.",
        "Kupuuza chakula, usingizi au majukumu.",
        "Kuficha tabia zako za betting.",
        "Kushindwa kuacha betting.",
        "Watu wengine kukuambia una tatizo la betting."
      ],

      self: "Kujizuia (Self-Exclusion)",
      selfText: [
        "Unaweza kujifungia account kwa muda au milele.",
        "Temporary exclusion inazuia matumizi kwa muda fulani.",
        "Permanent exclusion inamaanisha huwezi kutumia account tena.",
        "Usijaribu kukwepa mfumo huo."
      ],

      underage: "Kubeti Chini ya Umri",
      underageText: [
        "Lazima uwe na miaka 18 au zaidi kutumia platform hii.",
        "Tunaweza kuthibitisha umri wako wakati wowote.",
        "Ukigundulika chini ya umri, account itafungwa na ushindi unaweza kufutwa."
      ],

      fraud: "Udanganyifu & Hatua za Sheria",
      fraudText: [
        "Udanganyifu, cheating au manipulation ni marufuku kabisa.",
        "Account zinazohusika zinaweza kusimamishwa au kufungwa kabisa.",
        "Ushindi unaweza kufutwa.",
        "Kesi nzito zinaweza kupelekwa kwa vyombo vya sheria kulingana na sheria za gaming za nchi husika."
      ],

      support: "Pata Msaada",
      supportText: [
        "Ukihisi betting inakuwa tatizo, wasiliana na support.",
        "Unaweza pia kutafuta msaada wa ushauri wa kitaalamu.",
        "Tupo hapa kukusaidia ubaki kwenye udhibiti."
      ]
    },

    fr: {
      title: "Jeu Responsable",
      subtitle:
        "Nous encourageons les paris responsables. Gardez le contrôle et ne pariez que ce que vous pouvez perdre.",

      intro: "Introduction",
      introText: [
        "Nous encourageons tous les utilisateurs à considérer les paris comme un divertissement et non comme une source de revenu.",
        "Gardez toujours le contrôle de vos habitudes de jeu et utilisez uniquement l'argent que vous pouvez vous permettre de perdre.",
        "Si le jeu devient un problème, veuillez contacter notre équipe d'assistance."
      ],

      control: "Garder le Contrôle",
      controlText: [
        "Considérez le jeu comme un divertissement, non comme un revenu.",
        "Acceptez que le jeu repose sur le hasard.",
        "Ne laissez pas les paris perturber votre vie quotidienne ou vos responsabilités.",
        "Évitez de parier sous stress ou sous l'effet de l'alcool.",
        "Fixez des limites quotidiennes ou hebdomadaires.",
        "Ne poursuivez jamais vos pertes.",
        "Faites des pauses et surveillez votre activité."
      ],

      monitor: "Surveillez Votre Activité",
      monitorText: [
        "Vérifiez régulièrement les relevés de votre compte.",
        "Suivez vos dépôts, retraits et votre historique de paris.",
        "Si vous remarquez un problème, agissez immédiatement."
      ],

      warning: "Signes d'Alerte",
      warningText: [
        "Parier plus que ce que vous pouvez vous permettre.",
        "Emprunter ou voler de l'argent pour jouer.",
        "Négliger la nourriture, le sommeil ou les responsabilités.",
        "Cacher vos habitudes de jeu.",
        "Se sentir incapable d'arrêter.",
        "Entendre les autres dire que vous avez un problème de jeu."
      ],

      self: "Auto-Exclusion",
      selfText: [
        "L'auto-exclusion vous permet de fermer votre compte temporairement ou définitivement.",
        "L'exclusion temporaire bloque l'accès pendant une période définie.",
        "L'exclusion permanente signifie que vous ne pourrez plus accéder à votre compte.",
        "N'essayez pas de contourner les restrictions."
      ],

      underage: "Jeu des Mineurs",
      underageText: [
        "Vous devez avoir 18 ans ou plus pour utiliser cette plateforme.",
        "Nous pouvons vérifier votre âge à tout moment.",
        "Si vous êtes mineur, votre compte sera fermé et les gains pourront être annulés."
      ],

      fraud: "Fraude & Action Légale",
      fraudText: [
        "La fraude, la triche ou la manipulation sont strictement interdites.",
        "Les comptes impliqués peuvent être suspendus ou fermés définitivement.",
        "Les gains peuvent être annulés.",
        "Les cas graves peuvent être signalés aux autorités compétentes selon les lois nationales."
      ],

      support: "Obtenir de l'Aide",
      supportText: [
        "Si vous sentez que le jeu devient un problème, contactez l'assistance.",
        "Vous pouvez également consulter des services de conseil indépendants.",
        "Nous sommes là pour vous aider à garder le contrôle."
      ]
    }
  };

  const sections = useMemo(
    () => [
      "intro",
      "control",
      "monitor",
      "warning",
      "self",
      "underage",
      "fraud",
      "support"
    ],
    []
  );

  const warningSections = ["warning", "underage", "fraud"];

  return (
    <div className="rg-page">
      <div className="lang-switch">
        <button
          className={lang === "en" ? "active-lang" : ""}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          className={lang === "sw" ? "active-lang" : ""}
          onClick={() => setLang("sw")}
        >
          SW
        </button>
        <button
          className={lang === "fr" ? "active-lang" : ""}
          onClick={() => setLang("fr")}
        >
          FR
        </button>
      </div>

      <div className="rg-header">
        <h2>{t[lang].title}</h2>
        <p>{t[lang].subtitle}</p>
      </div>

      <div className="rg-container">
        {sections.map((sec) => {
          const isOpen = openSection === sec;
          const isWarning = warningSections.includes(sec);

          return (
            <div className={`rg-card ${isWarning ? "warning-card" : ""}`} key={sec}>
              <button
                className="rg-title"
                onClick={() => toggleSection(sec)}
              >
                <span>{t[lang][sec]}</span>
                <span>{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="rg-content">
                  <ul>
                    {(t[lang][`${sec}Text`] || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}