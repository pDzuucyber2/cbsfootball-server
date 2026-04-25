import React, { useState } from "react";  
import "./About.css";  
  
export default function About() {  
  const [language, setLanguage] = useState("en");  
  
  const content = {  
    en: {  
      langTitle: "Language",  
      aboutTitle: "About ContraBetScore",  
      section1Title: "About ContraBetScore",  
      section1Text1:  
        "ContraBetScore is a modern betting and casino platform designed to make betting simple, secure, and user-friendly for everyone.",  
      section1Text2:  
        "We use advanced technology to ensure every user gets the best betting experience possible.",  
  
      section2Title: "Welcome Bonus & Referral Rewards",  
      section2Text1:  
        "At ContraBetScore, we reward both new users and those who invite others:",  
      bonus1: "First Deposit Bonus: 10%",  
      bonus2: "Referral Bonus: 15% for the person who invited you",  
      exampleTitle: "Example:",  
      example1: "Deposit $100 → Your bonus = $ 10",  
      example2: "Referrer gets = $15",  
      example3: "Deposit $200 → Your bonus = $20",  
      example4: "Referral bonus = $25",  
  
      section3Title: "Customer Care and Trust",  
      section3Text1:  
        "One of our main goals is to provide excellent customer service at all times.",  
      section3Text2:  
        "Our support team is available 24/7 through the following channels:",  
      support1: "Live Chat",  
      support2: "WhatsApp",  
      support3: "Phone",  
      support4: "Email",  
      section3Text3:  
        "ContraBetScore believes that trust is the foundation of success.",  
      trust1: "Fast payments",  
      trust2: "Quick withdrawal process",  
      trust3: "Secure and reliable system",  
      trust4: "We promote responsible betting — only bet what you can afford.",  
  
      section4Title: "What Makes Us Different (AntScore System)",  
      section4Text1:  
        "What makes ContraBetScore different from many other betting companies is our company game system.",  
      section4Text2:  
        "If you follow a company game and lose, our platform team may return compensation for the money you lost.",  
      section4Text3:  
        "This compensation applies only to Correct Score games known as AntScore.",  
  
      section5Title: "Daily Game Signals",  
      section5Text1: "Agents receive 2 to 3 games per day.",  
      section5Text2:  
        "Regular users receive 1 game every day with possible profit between 2.5% and 3%.",  
      section5Text3:  
        "Compensation is only available for AntScore correct score games.",  
  
      section6Title: "Casino Platform",  
      section6Text1: "Our platform has more than 500 casino games.",  
      section6Text2:  
        "You can play and the winning rate can reach up to 94%.",  
      section6Text3:  
        "Try ContraBetScore and win millions through our exciting casino games.",  
  
      section7Title: "Changing Lives",  
      section7Text1:  
        "ContraBetScore is not only about entertainment, but also about helping communities and users improve their lives.",  
      section7Text2:  
        "Through promotions, bonuses, and commission systems:",  
      life1: "Users can grow their income",  
      life2: "Agents can earn daily income",  
      life3: "Financial opportunities are available for everyone",  
      section7Text3:  
        "We are committed to bringing positive change through innovation and better services.",  
  
      section8Title: "Our Vision",  
      vision1: "Trust",  
      vision2: "Fast payouts",  
      vision3: "Game innovation",  
      vision4: "Excellent customer support",  
  
      section9Title: "Warning",  
      warning1: "Bet responsibly",  
      warning2: "Do not use money you cannot afford to lose",  
  
      // NEW SECTION
      section10Title: "ContraBetScoreFootball Update",  
      section10Text1:
        "ContraBetScoreFootball started operating in 2018 across different countries like Mali, Europe, Egypt, Indonesia and more than 58 countries. In 2025 (December) it entered 8 African countries. Now in 2026 (April) it has entered East Africa and is active in 16 countries. CBS is one of the hot betting platforms in East Africa.",  
      nb: "NB: Always bet responsibly and manage your finances carefully.",  
  
      finalTitle: "Final Message",  
      finalText:  
        "Try ContraBetScore today — win big, win millions, and build your future."  
    },  
  
    sw: {  
      langTitle: "Lugha",  
      aboutTitle: "Kuhusu ContraBetScore",  
      section1Title: "Kuhusu ContraBetScore",  
      section1Text1:  
        "ContraBetScore ni jukwaa la kisasa la betting na casino lililoundwa kufanya ubashiri kuwa rahisi, salama, na rafiki kwa kila mtumiaji.",  
      section1Text2:  
        "Tunatumia teknolojia ya kisasa kuhakikisha kila mtumiaji anapata uzoefu bora wa betting.",  
  
      section2Title: "Bonasi ya Karibu na Tuzo ya Referral",  
      section2Text1:  
        "Katika ContraBetScore, tunawazawadia watumiaji wapya na pia wale wanaoalika wengine:",  
      bonus1: "Bonasi ya kwanza ya kuweka pesa: 10%",  
      bonus2: "Bonasi ya referral: 15% kwa aliyekualika",  
      exampleTitle: "Mfano:",  
      example1: "Ukiweka 10,000 → Bonasi yako = 1,000",  
      example2: "Aliyekualika anapata = 1,500",  
      example3: "Ukiweka 30,000 → Bonasi yako = 3,000",  
      example4: "Bonasi ya referral = 4,500", 

  
exampleTitle01: "Mfano:",  
      example5: "Ukiweka 100,000 → Bonasi yako = 10,000",  
      example6: "Aliyekualika anapata = 15,000",  
      example7: "Ukiweka 500,000 → Bonasi yako = 50,000",  
      example8: "Bonasi ya referral = 75,000",  
   example9: "Ukiweka 500,0000 → Bonasi yako = 50,0000",  
      example10: "Bonasi ya referral = 750,000",
  example11: "Ukiweka 100,0000 → Bonasi yako = 10,0000",  
      example12: "Bonasi ya referral = 15,0000",



      section3Title: "Huduma kwa Wateja na Uaminifu",  
      section3Text1:  
        "Moja ya malengo yetu makubwa ni kutoa huduma bora kwa wateja kila wakati.",  
      section3Text2:  
        "Timu yetu ya msaada inapatikana saa 24 kila siku kupitia njia zifuatazo:",  
      support1: "Live Chat",  
      support2: "WhatsApp",  
      support3: "Simu",  
      support4: "Email",  
      section3Text3:  
        "ContraBetScore inaamini kuwa uaminifu ndio msingi wa mafanikio.",  
      trust1: "Malipo ya haraka",  
      trust2: "Mchakato wa haraka wa withdrawal",  
      trust3: "Mfumo salama na wa kuaminika",  
      trust4: "Tunasisitiza betting ya uwajibikaji — cheza kiasi unachoweza kumudu.",  
  
      section4Title: "Kinachotutofautisha (Mfumo wa AntScore)",  
      section4Text1:  
        "Kinachotutofautisha ContraBetScore na kampuni nyingine nyingi za betting ni mfumo wetu wa mchezo wa company.",  
      section4Text2:  
        "Ukifuata mchezo wa company na ukapoteza, timu ya jukwaa inaweza kukurudishia fidia ya pesa ulizopoteza.",  
      section4Text3:  
        "Fidia hii inapatikana kwa michezo ya Correct Score inayojulikana kama AntScore pekee.",  
  
      section5Title: "Michezo ya Kila Siku",  
      section5Text1: "Agents watapokea michezo 2 hadi 3 kwa siku.",  
      section5Text2:  
        "Watumiaji wa kawaida watapata mchezo 1 kila siku wenye faida ya asilimia 2.5 hadi 3.",  
      section5Text3:  
        "Fidia inapatikana kwa mchezo wa AntScore correct score pekee.",  
  
      section6Title: "Jukwaa la Casino",  
      section6Text1: "Jukwaa letu lina zaidi ya michezo 500 ya casino.",  
      section6Text2:  
        "Unaweza kucheza na kiwango cha ushindi kinaweza kufika hadi 94%.",  
      section6Text3:  
        "Jaribu ContraBetScore na ushinde mamilioni kupitia michezo yetu ya casino.",  
  
      section7Title: "Kubadilisha Maisha",  
      section7Text1:  
        "ContraBetScore sio burudani tu, bali pia inalenga kusaidia jamii na watumiaji kubadilisha maisha yao.",  
      section7Text2:  
        "Kupitia promosheni, bonasi, na mifumo ya commission:",  
      life1: "Watumiaji wanaweza kukuza kipato chao",  
      life2: "Agents wanaweza kupata kipato cha kila siku",  
      life3: "Fursa za kifedha zinapatikana kwa kila mtu",  
      section7Text3:  
        "Tumejizatiti kuleta mabadiliko chanya kupitia ubunifu na huduma bora.",  
  
      section8Title: "Dira Yetu",  
      vision1: "Uaminifu",  
      vision2: "Malipo ya haraka",  
      vision3: "Ubunifu wa michezo",  
      vision4: "Huduma bora kwa wateja",  
  
      section9Title: "Tahadhari",  
      warning1: "Cheza kwa uwajibikaji",  
      warning2: "Usitumie pesa usizoweza kupoteza",  
  
      section10Title: "Sasisho la ContraBetScoreFootball",  
      section10Text1:
        "ContraBetScoreFootball ilianza mwaka 2018 katika nchi zaidi ya 58 kama Mali, Ulaya, Misri, Indonesia na zingine. Mwaka 2025 (Desemba) iliingia nchi 8 za Afrika. Sasa mwaka 2026 (Aprili) imeingia Afrika Mashariki na inafanya kazi katika nchi 16. CBS ni moja ya platformi kubwa za betting Afrika Mashariki.",  
      nb: "NB: Cheza kwa uwajibikaji na simamia fedha zako vizuri.",  
  
      finalTitle: "Ujumbe wa Mwisho",  
      finalText:  
        "Jaribu ContraBetScore leo — shinda vikubwa, shinda mamilioni, na jenga maisha yako ya baadaye."  
    },  
  
    fr: {  
      langTitle: "Langue",  
      aboutTitle: "À propos de ContraBetScore",  
      section1Title: "À propos de ContraBetScore",  
      section1Text1:  
        "ContraBetScore est une plateforme moderne de paris et de casino conçue pour rendre les paris simples, sûrs et conviviaux pour tout le monde.",  
      section1Text2:  
        "Nous utilisons une technologie avancée pour garantir à chaque utilisateur la meilleure expérience de pari possible.",  
  
      section2Title: "Bonus de bienvenue et récompenses de parrainage",  
      section2Text1:  
        "Chez ContraBetScore, nous récompensons à la fois les nouveaux utilisateurs et ceux qui invitent d'autres personnes :",  
      bonus1: "Bonus du premier dépôt : 10%",  
      bonus2: "Bonus de parrainage : 15% pour la personne qui vous a invité",  
      exampleTitle: "Exemple :",  
      example1: "Dépôt de 10,000 → Votre bonus = 1,000",  
      example2: "Le parrain reçoit = 1,500",  
      example3: "Dépôt de 30,000 → Votre bonus = 3,000",  
      example4: "Bonus de parrainage = 4,500",  
  
      section3Title: "Service client et confiance",  
      section3Text1:  
        "L'un de nos principaux objectifs est de fournir un excellent service client à tout moment.",  
      section3Text2:  
        "Notre équipe d'assistance est disponible 24h/24 et 7j/7 via :",  
      support1: "Chat en direct",  
      support2: "WhatsApp",  
      support3: "Téléphone",  
      support4: "Email",  
      section3Text3:  
        "ContraBetScore estime que la confiance est la base du succès.",  
      trust1: "Paiements rapides",  
      trust2: "Processus de retrait rapide",  
      trust3: "Système sécurisé et fiable",  
      trust4: "Nous encourageons le pari responsable — ne pariez que ce que vous pouvez vous permettre.",  
  
      section4Title: "Ce qui nous rend différents (Système AntScore)",  
      section4Text1:  
        "Ce qui distingue ContraBetScore de nombreuses autres sociétés de paris est notre système de jeux d'entreprise.",  
      section4Text2:  
        "Si vous suivez un jeu de la société et que vous perdez, notre équipe peut vous rembourser l'argent perdu.",  
      section4Text3:  
        "Cette compensation s'applique uniquement aux jeux Correct Score appelés AntScore.",  
  
      section5Title: "Pronostics quotidiens",  
      section5Text1: "Les agents reçoivent 2 à 3 jeux par jour.",  
      section5Text2:  
        "Les utilisateurs ordinaires reçoivent 1 jeu par jour avec un profit possible entre 2,5% et 3%.",  
      section5Text3:  
        "La compensation est disponible uniquement pour les jeux AntScore correct score.",  
  
      section6Title: "Plateforme Casino",  
      section6Text1: "Notre plateforme propose plus de 500 jeux de casino.",  
      section6Text2:  
        "Vous pouvez jouer avec un taux de gain pouvant atteindre 94%.",  
      section6Text3:  
        "Essayez ContraBetScore et gagnez des millions grâce à nos jeux de casino passionnants.",  
  
      section7Title: "Changer des vies",  
      section7Text1:  
        "ContraBetScore ne concerne pas seulement le divertissement, mais aussi l'amélioration de la vie des utilisateurs et des communautés.",  
      section7Text2:  
        "Grâce aux promotions, bonus et systèmes de commission :",  
      life1: "Les utilisateurs peuvent augmenter leurs revenus",  
      life2: "Les agents peuvent gagner un revenu quotidien",  
      life3: "Les opportunités financières sont disponibles pour tous",  
      section7Text3:  
        "Nous nous engageons à apporter un changement positif grâce à l'innovation et à de meilleurs services.",  
  
      section8Title: "Notre Vision",  
      vision1: "Confiance",  
      vision2: "Paiements rapides",  
      vision3: "Innovation dans les jeux",  
      vision4: "Excellent support client",  
  
      section9Title: "Avertissement",  
      warning1: "Pariez de manière responsable",  
      warning2: "N'utilisez pas d'argent que vous ne pouvez pas vous permettre de perdre",  
  
      section10Title: "Mise à jour ContraBetScoreFootball",  
      section10Text1:
        "ContraBetScoreFootball a commencé en 2018 dans plus de 58 pays comme le Mali, l'Europe, l'Égypte, l'Indonésie. En décembre 2025, il est entré dans 8 pays africains. En avril 2026, il est entré en Afrique de l'Est et est actif dans 16 pays. CBS est une plateforme de paris très populaire en Afrique de l'Est.",  
      nb: "NB: Jouez de manière responsable et gérez bien vos finances.",  
  
      finalTitle: "Message Final",  
      finalText:  
        "Essayez ContraBetScore aujourd'hui — gagnez gros, gagnez des millions et construisez votre avenir."  
    }  
  };  
  
  const t = content[language];  
  
  return (  
    <div className="about-page">  
      <div className="about-header">  
        <h2>{t.aboutTitle}</h2>  
  
        <div className="lang-switcher">  
          <button className={language === "sw" ? "active-lang" : ""} onClick={() => setLanguage("sw")}>SW</button>  
          <button className={language === "en" ? "active-lang" : ""} onClick={() => setLanguage("en")}>EN</button>  
          <button className={language === "fr" ? "active-lang" : ""} onClick={() => setLanguage("fr")}>FR</button>  
        </div>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section1Title}</h3>  
        <p>{t.section1Text1}</p>  
        <p>{t.section1Text2}</p>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section2Title}</h3>  
        <p>{t.section2Text1}</p>  
        <ul>  
          <li>{t.bonus1}</li>  
          <li>{t.bonus2}</li>  
        </ul>  
        <p><strong>{t.exampleTitle}</strong></p>  
        <p>{t.example1}</p>  
        <p>{t.example2}</p>  
        <p>{t.example3}</p>  
        <p>{t.example4}</p>  
         <p>{t.example5}</p> 
          <p>{t.example6}</p> 
           <p>{t.example7}</p> 
            <p>{t.example8}</p> 
             <p>{t.example9}</p> 
              <p>{t.example10}</p> 
               <p>{t.example11}</p> 
                <p>{t.example12}</p> 
      </div>  
  
      <div className="about-card">  
        <h3>{t.section3Title}</h3>  
        <p>{t.section3Text1}</p>  
        <p>{t.section3Text2}</p>  

        <ul>  
          <li>{t.support1}</li>  
          <li>{t.support2}</li>  
          <li>{t.support3}</li>  
          <li>{t.support4}</li>  
        </ul>  
        <p>{t.section3Text3}</p>  
        <ul>  
          <li>{t.trust1}</li>  
          <li>{t.trust2}</li>  
          <li>{t.trust3}</li>  
          <li>{t.trust4}</li>  
        </ul>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section4Title}</h3>  
        <p>{t.section4Text1}</p>  
        <p>{t.section4Text2}</p>  
        <p>{t.section4Text3}</p>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section5Title}</h3>  
        <p>{t.section5Text1}</p>  
        <p>{t.section5Text2}</p>  
        <p>{t.section5Text3}</p>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section6Title}</h3>  
        <p>{t.section6Text1}</p>  
        <p>{t.section6Text2}</p>  
        <p>{t.section6Text3}</p>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section7Title}</h3>  
        <p>{t.section7Text1}</p>  
        <p>{t.section7Text2}</p>  
        <ul>  
          <li>{t.life1}</li>  
          <li>{t.life2}</li>  
          <li>{t.life3}</li>  
        </ul>  
        <p>{t.section7Text3}</p>  
      </div>  
  
      <div className="about-card">  
        <h3>{t.section8Title}</h3>  
        <ul>  
          <li>{t.vision1}</li>  
          <li>{t.vision2}</li>  
          <li>{t.vision3}</li>  
          <li>{t.vision4}</li>  
        </ul>  
      </div>  
  
      <div className="about-card warning-card">  
        <h3>{t.section9Title}</h3>  
        <p>👉 {t.warning1}</p>  
        <p>👉 {t.warning2}</p>  
      </div>  
  
      {/* NEW SECTION */}  
      <div className="about-card">  
        <h3>{t.section10Title}</h3>  
        <p>{t.section10Text1}</p>  
        <p><strong>{t.nb}</strong></p>  
      </div>  
  
      <div className="about-card final-card">  
        <h3>{t.finalTitle}</h3>  
        <p>{t.finalText}</p>  
        <p>{t.finalText}</p>  
        <p><strong>{t.nb}</strong></p>  
      </div>  
    </div>  
  );  
}