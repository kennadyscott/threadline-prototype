/* Threadline — shared brand model + compilers.
   Both onboarding paths compile their inputs into ONE brand model, save it,
   and the Brand Review deck renders every slide from it. */
(function(){
  const KEY='threadline.brand';

  /* ---------- helpers ---------- */
  const clean=s=>(s||'').trim().replace(/[.!?,;:\s]+$/,'');
  const cap=s=>{ s=(s||'').trim(); return s? s.charAt(0).toUpperCase()+s.slice(1) : s; };
  const lc=s=>{ s=(s||'').trim(); return s? s.charAt(0).toLowerCase()+s.slice(1) : s; };
  const dot=s=>{ s=(s||'').trim(); return s && !/[.!?]$/.test(s) ? s+'.' : s; };
  const short=(s,n)=>{ const w=(s||'').trim().split(/\s+/); return w.length<=n? (s||'').trim() : w.slice(0,n).join(' ')+'…'; };
  const capWord=s=>cap((s||'').trim());
  const splitList=s=>(s||'').split(/[,\/·]+|\band\b/i).map(x=>x.trim()).filter(Boolean);
  const stripTags=s=>(s||'').replace(/<[^>]+>/g,'');
  window.stripTags=stripTags;

  const PCOL=['#803dff','#3b82f6','#22d3ee','#fb7185'];
  const CAD=['Weekly · Carousel','Biweekly · Reel','Weekly · Static','Weekly · Graphic','Monthly · Q&A'];

  /* ---------- voice presets ---------- */
  const VOICE={
    Warm:{ traits:['Warm','Clear','Encouraging'],
      spectrum:[['Warm','Formal',25],['Playful','Serious',50],['Calm','Energetic',38],['Supportive','Challenging',30],['Conversational','Polished',30]],
      sentence:'Short, plain, and human. One idea at a time.',
      tone:'Talk to one person. Lead with empathy, then the point.',
      use:['you','simple','together','real','clarity'], avoid:['hustle','guru','synergy','crush it','unlock'],
      phrases:["Let’s make it simple.","You’ve got this."],
      headline:"You don’t need to do more. You need to do what matters.",
      caption:"Feeling behind isn’t a character flaw—it’s a sign you’re carrying too much. Let’s lighten it.",
      cta:'Start here', never:['cold','corporate','hype-driven'],
      soundsLike:['"Let’s make this simple."','"Here’s what actually matters."'],
      notLike:['"Unlock explosive growth!"','"Leverage our synergistic framework."'],
      email:"Hey — quick check-in. If this week feels like a lot, you’re not behind. Let’s find the one thing that matters." },
    Bold:{ traits:['Bold','Direct','Confident'],
      spectrum:[['Warm','Formal',45],['Playful','Serious',55],['Calm','Energetic',72],['Supportive','Challenging',68],['Conversational','Polished',40]],
      sentence:'Short. Punchy. No hedging.',
      tone:'Say the real thing. Cut the throat-clearing.',
      use:['stop','start','truth','now','better'], avoid:['maybe','just','kind of','synergy','circle back'],
      phrases:['Stop guessing.','Do the real thing.'],
      headline:'Stop waiting for perfect. Start now.',
      caption:"Nobody’s coming to hand you permission. Decide, then move.",
      cta:'Get started', never:['wishy-washy','corporate','timid'],
      soundsLike:['"Stop guessing. Start building."','"Your best work deserves better."'],
      notLike:['"We humbly invite you to consider…"','"Synergize your workflow."'],
      email:"No fluff: most of your to-do list doesn’t matter this week. Here’s the part that does." },
    Polished:{ traits:['Polished','Precise','Assured'],
      spectrum:[['Warm','Formal',68],['Playful','Serious',62],['Calm','Energetic',40],['Supportive','Challenging',48],['Conversational','Polished',72]],
      sentence:'Considered, clear, and complete.',
      tone:'Professional and precise. Earn trust through substance.',
      use:['strategy','considered','deliberate','proven','results'], avoid:['hype','slang','crush it','guru','vibes'],
      phrases:['Considered by design.','Built to last.'],
      headline:'A more considered way to grow.',
      caption:'Sustainable results come from deliberate decisions, not louder tactics.',
      cta:'Learn more', never:['sloppy','gimmicky','loud'],
      soundsLike:['"A considered approach to growth."','"Built on proven fundamentals."'],
      notLike:['"This ONE hack changed everything!!"','"Let’s gooo 🚀"'],
      email:'A brief note on where to focus this week—and the one decision that compounds.' },
    Playful:{ traits:['Playful','Friendly','Bright'],
      spectrum:[['Warm','Formal',28],['Playful','Serious',22],['Calm','Energetic',65],['Supportive','Challenging',40],['Conversational','Polished',22]],
      sentence:'Light, quick, and a little cheeky.',
      tone:'Have fun. Be a person, not a brand.',
      use:['honestly','fun','tiny','win','real'], avoid:['leverage','synergy','robust','utilize','paradigm'],
      phrases:["Let’s have some fun with it.","Tiny wins count."],
      headline:'Your to-do list called. It misses you.',
      caption:"Progress doesn’t have to be painful. Sometimes it’s one tiny, slightly ridiculous first step.",
      cta:'Jump in', never:['stiff','corporate','boring'],
      soundsLike:['"Let’s make this fun."','"One tiny win, coming up."'],
      notLike:['"Per my last email…"','"Kindly leverage the attached."'],
      email:'Hi! Your inbox is chaos and so is mine. Let’s fix one small thing today. 🙂' }
  };
  function pickVoice(v){ return VOICE[v] || VOICE.Warm; }
  function voiceFromTraits(list){ const s=(list||[]).join(' ').toLowerCase();
    if(/bold|confiden|direct|strong/.test(s)) return 'Bold';
    if(/polish|profess|precise|refined|formal/.test(s)) return 'Polished';
    if(/play|fun|bright|cheek|quirk/.test(s)) return 'Playful';
    return 'Warm'; }

  /* ---------- direction presets (Path 2 positioning choice) ---------- */
  const DIR={
    'The strategic partner':{ tagline:'Clear thinking, better decisions.',
      frame:'is the strategic partner that turns scattered thinking into a plan they can act on',
      saysLine:'You win by making the complicated feel <b>doable</b>—not by shouting louder.',
      knownFor:'Making the complicated feel doable.', primaryMsg:'Clarity is the fastest path to confident growth.',
      different:'Expert guidance built around how they actually work.',
      theyFeel:'Overwhelmed & uncertain', theyBecome:'Clear & confident',
      struggle:'Too much advice, no clear next step.', achieve:'A focused plan they trust.' },
    'The supportive companion':{ tagline:'You don’t have to carry it alone.',
      frame:'is the supportive partner that takes the weight off and helps them move forward',
      saysLine:'You win by <b>taking the weight off</b>, not adding to it.',
      knownFor:'Making hard things feel lighter.', primaryMsg:'Support is the fastest path to sustainable progress.',
      different:'A steady partner who meets them where they are.',
      theyFeel:'Overwhelmed & alone', theyBecome:'Supported & steady',
      struggle:'Carrying too much with no support.', achieve:'A lighter load and steady progress.' },
    'The momentum engine':{ tagline:'Less overthinking. More doing.',
      frame:'is the momentum engine that turns ideas into consistent action',
      saysLine:'You win on <b>momentum</b>—turning ideas into motion fast.',
      knownFor:'Turning ideas into action.', primaryMsg:'Momentum beats perfection, every time.',
      different:'A system that keeps them moving, not stuck.',
      theyFeel:'Stuck & stalled', theyBecome:'Moving & consistent',
      struggle:'Great ideas that never ship.', achieve:'Consistent action and real momentum.' },
    'default':{ tagline:'Clear, consistent, yours.',
      frame:'helps them get real results without the noise',
      saysLine:'You win by being unmistakably <b>you</b>.',
      knownFor:'Being the clear choice in your space.', primaryMsg:'',
      different:'A distinct point of view your audience trusts.',
      theyFeel:'Overwhelmed', theyBecome:'Confident',
      struggle:'Too many options, not enough clarity.', achieve:'A clear path forward.' }
  };
  const GEN={ goals:'Steady, sustainable growth.', emotional:'To feel understood and on the right track.',
    objections:'"I’ve tried things before." "I don’t have time." "Is it worth it?"',
    triggers:'A stall, a big decision, or a launch.',
    supporting:'You don’t need more—you need what matters. Progress comes from decisions, not busywork.',
    valueProps:'Clarity · confidence · momentum.', beliefs:'Simple beats clever. Focus beats effort.',
    pov:'Most advice adds noise instead of removing it.',
    imagery:'Real, unstaged moments in warm, natural light. A simple motif that underlines key words.' };

  /* ---------- the compiler ---------- */
  function buildModel(i){
    const vp=pickVoice(i.voicePick);
    const dir=DIR[i.direction]||DIR['default'];
    const name=(i.name||'').trim()||'Your Brand';
    const who=clean(i.audienceWho);
    const become=clean(i.audienceBecome);
    const pain=clean(i.audiencePain);
    const traits=((i.words&&i.words.length)?i.words:vp.traits).slice(0,4).map(capWord);
    const colors=(i.colors&&i.colors.length)?i.colors:['#1B2A4A','#803DFF','#22D3EE','#F4EFE9'];
    const pillars=(i.pillars&&i.pillars.length)?i.pillars:[
      ['Education','#803dff','Teach one useful thing.',30],['Behind the Brand','#3b82f6','Show the real process.',25],
      ['Proof','#22d3ee','Wins and results.',25],['Point of View','#fb7185','Your take on the space.',20]];
    const oneLine=clean(i.oneLine)? dot(clean(i.oneLine)) : dot(name+' — '+dir.frame.replace(/^is |^helps /,''));
    const heart= who ? (lc(who)+(become?(' feel '+lc(become)):' get real results')) : stripTagsLocal(lc(short(oneLine,16)));
    const tagline=i.tagline||dir.tagline||(name+', made clear.');
    return {
      name, tagline, taglineOptions:[tagline,'Clear beats clever.','Show up consistently.'],
      heartLine:heart,
      overview:{ oneLine,
        mission: i.why?dot(cap(clean(i.why))): 'To help '+(who||'the people you serve')+' '+(become?('feel '+lc(become)):'move forward with confidence')+'.',
        promise: become?('They leave feeling '+lc(become)+'.'):'A clearer, more confident way forward.',
        audience: i.audiencePrimary?dot(cap(i.audiencePrimary)):(who?dot(cap(who)):'The people you most want to reach.'),
        differentiator: i.wrong?('The category gets this wrong when '+lc(clean(i.wrong))+'. You don’t.'):dir.different },
      positioning:{ saysLine:dir.saysLine,
        statement:'For '+(who?short(who,10):'your audience')+', <b>'+name+'</b> '+dir.frame+(i.wrong?('—unlike the norm, where '+lc(clean(i.wrong))):'')+'.',
        theyFeel: pain?short(pain,6):dir.theyFeel, theyBecome: become?short(become,6):dir.theyBecome,
        struggle: pain?dot(cap(pain)):dir.struggle, achieve: become?dot(cap(become)):dir.achieve,
        different: dir.different, knownFor: dir.knownFor },
      audience:{ saysLine:'This is a person, not a demographic. Meet the customer you keep helping.',
        primary: i.audiencePrimary?dot(cap(i.audiencePrimary)):(who?dot(cap(who)):'Your core audience.'),
        goals: GEN.goals, pains: pain?dot(cap(pain)):'The friction they feel today.',
        emotional: GEN.emotional, objections: i.audienceTired?('Tired of '+lc(clean(i.audienceTired))+'.'):GEN.objections,
        triggers: GEN.triggers,
        language: who?['"Someone like me just wants '+(become?lc(become):'this to work')+'."']:['"I just want this to work."'],
        questions: i.questions&&i.questions.length?i.questions:['What should I do next?','Am I doing the right thing?','Is this worth it?'] },
      personality:{ spectrums:vp.spectrum,
        summary:'In a sentence: <b>'+traits.map(lc).join(', ')+'.</b> Never '+((i.never&&i.never.length?i.never:vp.never).slice(0,3).map(lc).join(', '))+'.' },
      voice:{ saysLine:'This is the most important approval. It trains every piece of content Threadline writes for you.',
        traits, sentence:vp.sentence, tone:vp.tone,
        use:(i.words&&i.words.length)?i.words.concat(vp.use).slice(0,5):vp.use,
        avoid:(i.never&&i.never.length)?i.never.slice(0,5):vp.avoid,
        phrases:vp.phrases, headline:vp.headline, caption:vp.caption, cta:vp.cta,
        soundsLike:vp.soundsLike, notLike:vp.notLike },
      messaging:{ primary: i.believe?('We believe '+lc(clean(i.believe))+'.'):(dir.primaryMsg||(name+' makes it simple to show up consistently.')),
        supporting: GEN.supporting, beliefs: i.believe?dot(cap(clean(i.believe))):GEN.beliefs,
        pov: i.wrong?('The industry gets this wrong when '+lc(clean(i.wrong))+'.'):GEN.pov,
        valueProps: GEN.valueProps,
        pitch: name+' helps '+(who?lc(who):'people')+' '+(become?('feel '+lc(become)):'get where they want to go')+'—without the noise.' },
      pillars,
      series: pillars.slice(0,5).map((p,idx)=>[p[0], CAD[idx%CAD.length], p[2], p[0]]),
      visual:{ colors, type:'Satoshi · Inter', imagery:GEN.imagery },
      preview:{ post:vp.caption, cover:'3 things '+(who?short(who,5):'your audience')+' needs to hear', email:vp.email, headline:vp.headline, cta:vp.cta }
    };
  }
  function stripTagsLocal(s){ return (s||'').replace(/<[^>]+>/g,''); }

  /* ---------- path compilers ---------- */
  function compileFromBuild(state, pillarsRaw){
    const pillars=(pillarsRaw||[]).map((p,idx)=>[p.n, p.c||PCOL[idx%4], p.p||'', parseInt(p.mix)||25]);
    return buildModel({
      source:'build', name:state.name, oneLine:state.idea, why:state.why,
      audienceWho:state.audWho, audiencePrimary:state.audWho, audiencePain:state.audPain,
      audienceTired:state.audTired, audienceBecome:state.feel,
      believe:state.believe, wrong:state.wrong,
      direction:state.positioning, voicePick:state.voicePick,
      words:splitList(state.words), never:splitList(state.neverWords),
      pillars:pillars.length?pillars:null });
  }
  function compileFromImport(state, snap){
    snap=snap||{};
    const themes=(snap.themes&&snap.themes.length)?snap.themes:['Education','Behind the brand','Proof','Point of view'];
    const pillars=themes.slice(0,4).map((t,idx)=>[t, PCOL[idx%4], 'Content around '+lc(t)+'.', Math.round(100/Math.min(themes.length,4))]);
    return buildModel({
      source:'import', name:snap.name||state.name, oneLine:snap.summary,
      audienceWho: snap.audience?short(snap.audience,8):'', audiencePrimary:snap.audience,
      voicePick: voiceFromTraits(snap.voice), words:(snap.voice||[]).slice(0,4),
      colors:snap.colors, themes, pillars, direction:'default' });
  }

  /* ---------- default sample (Groundwork) — used when no data ---------- */
  function defaultBrand(){ return {
    name:'Groundwork', tagline:'Know your next move.',
    taglineOptions:['Know your next move.','Clarity, then confidence.','Less noise. More momentum.'],
    heartLine:'small business owners find clarity and turn it into confident action',
    overview:{ oneLine:'Clarity coaching that helps small business owners turn overwhelm into confident action.',
      mission:'To help overwhelmed founders cut through the noise and make decisions they trust.',
      promise:'You’ll always know your next right move.',
      audience:'Solo & small business owners in their first five years.',
      differentiator:'Strategy that fits how they actually work—no corporate frameworks, no fluff.' },
    positioning:{ saysLine:'You’re not competing on more tactics. You win by making the complicated feel <b>doable</b>.',
      statement:'For small business owners drowning in advice, <b>Groundwork</b> is the clarity coach that turns scattered thinking into a plan they’ll actually follow—unlike generic business courses that just add to the pile.',
      theyFeel:'Overwhelmed & uncertain', theyBecome:'Clear & confident',
      struggle:'Too much advice, no clear next step.', achieve:'A focused plan and the confidence to act on it.',
      different:'1:1, practical, built around their real constraints.', knownFor:'Making the complicated feel doable.' },
    audience:{ saysLine:'This is a person, not a demographic. Meet the founder you keep helping.',
      primary:'Solo founders & small teams, one to five years in.', goals:'Steady growth without burning out.',
      pains:'Decision paralysis; too many shiny objects; second-guessing.',
      emotional:'Reassurance they’re focused on the right thing.',
      objections:'"I’ve tried coaches before." "Too expensive." "No time."',
      triggers:'A stall in growth, a big decision, or an upcoming launch.',
      language:['"I just need to know what to focus on."','"I’m spread too thin."','"Am I doing the right thing?"'],
      questions:['What should I do next?','Am I pricing this right?','Is this worth my time?'] },
    personality:{ spectrums:[['Warm','Formal',22],['Playful','Serious',64],['Calm','Energetic',30],['Supportive','Challenging',38],['Conversational','Polished',28]],
      summary:'In a sentence: <b>clear, supportive, and strategically confident.</b> Never cold, overly corporate, or hype-driven.' },
    voice:{ saysLine:'This is the most important approval. It trains every piece of content Threadline writes for you.',
      traits:['Clear','Grounded','Encouraging'], sentence:'Short, plain, direct. One idea at a time.',
      tone:'Lead with the point. No jargon. Talk to one person.',
      use:['clarity','next step','focus','doable','momentum'], avoid:['hustle','crush it','guru','synergy','unlock'],
      phrases:['Your next right move.','Let’s make it doable.'],
      headline:'You don’t need more ideas. You need a next step.',
      caption:'Overwhelm isn’t a work-ethic problem. It’s a clarity problem. Let’s fix the clarity.',
      cta:'Book a clarity session',
      soundsLike:['"Here’s your next right move."','"Let’s make this doable."'],
      notLike:['"Unlock explosive growth, fast!"','"Leverage our synergistic framework."'] },
    messaging:{ primary:'Clarity is the fastest path to confident growth.',
      supporting:'You don’t need more tactics—you need focus. Businesses grow on decisions, not busywork.',
      beliefs:'Overwhelm is a clarity problem. Simple beats clever.',
      pov:'Most business advice adds noise instead of removing it.',
      valueProps:'A plan you’ll follow · decisions you trust · less second-guessing.',
      pitch:'Groundwork helps small business owners cut through the noise and know their next right move—so they grow with confidence instead of guesswork.' },
    pillars:[['Clarity & Strategy','#803dff','Help them decide before creating more.',30],
      ['Behind the Business','#3b82f6','Show the real process—build trust.',25],
      ['Proof & Progress','#22d3ee','Client wins and visible momentum.',25],
      ['Straight Talk','#fb7185','Bust a common business myth.',20]],
    series:[['Next Right Move','Weekly · Carousel','One decision framework per week.','Clarity & Strategy'],
      ['Founder Diaries','Biweekly · Reel','The real, unpolished process.','Behind the Business'],
      ['Clarity Wins','Weekly · Static','A client’s before → after.','Proof & Progress'],
      ['Myth Monday','Weekly · Graphic','Debunk one piece of bad advice.','Straight Talk'],
      ['Ask Groundwork','Monthly · Q&A','Answer real audience questions.','Clarity & Strategy']],
    visual:{ colors:['#1B2A4A','#803DFF','#22D3EE','#F4EFE9'], type:'Satoshi · Inter',
      imagery:'Real, unstaged founder moments. Warm natural light. Motif: a single grounding line underscoring key words.' },
    preview:{ post:'Overwhelm isn’t a sign you’re behind. It’s a sign you have too many open loops. Pick one. Close it. That’s momentum. →',
      cover:'3 questions that reveal your next right move',
      email:'Hey — quick one. If everything feels urgent this week, nothing is. Let’s find the one thing that actually moves the needle.',
      headline:'Stop collecting advice. Start making decisions.', cta:'Book a clarity session' } };
  }

  /* ---------- persistence ---------- */
  window.saveBrand=function(b){ try{ localStorage.setItem(KEY, JSON.stringify(b)); }catch(e){} };
  window.loadBrand=function(){ try{ const r=localStorage.getItem(KEY); return r?JSON.parse(r):null; }catch(e){ return null; } };
  window.clearBrand=function(){ try{ localStorage.removeItem(KEY); }catch(e){} };
  window.defaultBrand=defaultBrand;
  window.compileFromBuild=compileFromBuild;
  window.compileFromImport=compileFromImport;
})();
