/* Sentence-based browser speech controls; no audio uploads or generated audio files. */
(() => {
  window.createHSKReadingAudio = ({synth, beforePlay, voice, notice, hideNotice}) => {
    const selector = '[data-reading-audio],button[onclick*="hskReadPassage"]';
    let state = null, view = null, request = 0, utterance = null, queue = [], timer = null, pauseTimer = null, selection = null, pointerSelection = null;
    const write = (node, text) => { if (node.textContent !== text) node.textContent = text; };
    function sentences(text) {
      return [...text.matchAll(/[^。！？!?；;\n]+[。！？!?；;]*[”’」』"]*/g)]
        .filter(m => m[0].trim()).map(m => ({text:m[0].trim(),start:m.index,end:m.index+m[0].length}));
    }
    function passage(button) {
      const panel = button.closest('.reading-study,.h2-passage,.panel');
      return panel?.querySelector('.h2-passage-text') || panel?.querySelector(':scope > p.hanzi');
    }
    function source(button) { return String(button.dataset.say ?? button.dataset.text ?? passage(button)?.textContent ?? '').trim(); }
    function cancel() {
      ++request; clearTimeout(timer); clearTimeout(pauseTimer); utterance = null; queue = [];
      if (synth?.speaking || synth?.pending || synth?.paused) synth.cancel();
    }
    function update() {
      if (!state || !view) return;
      const playing = state.status === 'playing', paused = state.status === 'paused';
      write(view.play, playing ? '⏸ Tạm dừng' : paused && state.hasPlayed ? '▶ Tiếp tục' : state.status === 'ended' ? '↻ Nghe lại' : '🔊 Nghe đoạn');
      view.play.setAttribute('aria-pressed', String(playing));
      view.start.value = String(state.first); view.end.value = String(state.last);
      view.slider.min = String(state.first); view.slider.max = String(state.last); view.slider.value = String(state.index);
      view.slider.disabled = state.first === state.last;
      view.slider.setAttribute('aria-valuetext', `Câu ${state.index+1} trên ${state.parts.length}`);
      view.previous.disabled = state.index <= state.first;
      view.next.disabled = state.index >= state.last;
      write(view.position, `${state.selected ? 'Phần bôi đen · ' : ''}Câu ${state.index+1}/${state.parts.length}`);
      const part = state.parts[state.index];
      write(view.preview, state.text.slice(Math.max(part.start,state.from),Math.min(part.end,state.to)).trim());
      view.selection.disabled = !selection && !pointerSelection;
    }
    function canSpeak() {
      if (synth && typeof window.SpeechSynthesisUtterance === 'function') return true;
      notice('Trình duyệt này chưa hỗ trợ đọc tiếng Trung. Hãy mở trang bằng Safari hoặc Chrome phiên bản mới.');
      return false;
    }
    function speakCurrent(systemVoice = false) {
      if (!state || !canSpeak()) return;
      cancel(); beforePlay();
      if (synth.paused) synth.resume();
      state.hasPlayed = true; state.status = 'playing'; update(); hideNotice();
      const id = request, current = state, chosen = systemVoice ? null : voice();
      const watch = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (id === request && current === state && state.status === 'playing') {
            pause(true); notice('Chưa nhận được tín hiệu phát âm. Hãy thử tiếp tục và kiểm tra âm lượng thiết bị.', () => speakCurrent(true));
          }
        },5000);
      };
      for(let index=state.index;index<=state.last;index++) {
        const start=Math.max(index===state.index?state.cursor:0,state.from,state.parts[index].start);
        const end=Math.min(state.parts[index].end,state.to);if(start>=end)continue;
        const u=new SpeechSynthesisUtterance(state.text.slice(start,end));
        u.lang='zh-CN';u.rate=state.rate;u.pitch=1;u.volume=1;
        if(chosen){u.voice=chosen;u.lang=chosen.lang.replace(/_/g,'-');}
        u.onstart=()=>{
          if(id!==request||current!==state)return;
          if(state.status==='paused'){cancel();update();return;}
          utterance=u;state.index=index;state.cursor=start;clearTimeout(timer);hideNotice();update();
        };
        u.onboundary=event=>{
          if(id!==request||current!==state||state.status!=='playing'||utterance!==u)return;
          if(Number.isInteger(event.charIndex)&&event.charIndex>=0&&event.charIndex<u.text.length)state.cursor=start+event.charIndex;
        };
        u.onend=()=>{
          if(id!==request||current!==state)return;
          clearTimeout(timer);if(utterance===u)utterance=null;
          if(state.status==='paused')return;
          state.cursor=end;
          if(index<state.last&&state.parts[index+1].start<state.to){state.index=index+1;state.cursor=Math.max(state.from,state.parts[index+1].start);watch();}
          else{state.status='ended';queue=[];hideNotice();}
          update();
        };
        u.onerror=event=>{
          if(id!==request||current!==state||utterance&&utterance!==u)return;
          clearTimeout(timer);state.status='paused';
          // Cancel queued sentences too; a retry must start at the retained position.
          cancel();update();
          if(['canceled','interrupted'].includes(event.error))return;
          notice('Chưa phát được tiếng Trung. Bấm Tiếp tục để thử lại từ vị trí đang nghe.',()=>speakCurrent(true));
        };
        queue.push(u);
      }
      if(!queue.length){state.status='ended';update();return;}
      utterance=queue[0];watch();
      // Queue every chosen sentence synchronously in this user gesture (including on iOS).
      // The native engine advances the queue; onend never starts speech outside a gesture.
      const pending=[...queue];
      for(const u of pending){
        if(id!==request||current!==state||state.status!=='playing')break;
        try{synth.speak(u);}catch(error){u.onerror({error:error.name});break;}
      }
    }
    function pause(forceCancel = false) {
      if (!state || state.status !== 'playing') return;
      state.status = 'paused'; clearTimeout(timer); update();
      if (forceCancel || typeof synth?.pause !== 'function') { cancel(); return; }
      try { synth.pause(); } catch { cancel(); return; }
      // Android voices can ignore pause(); cancel there, retaining the last boundary.
      pauseTimer = setTimeout(() => { if (state?.status === 'paused' && utterance && !synth.paused) cancel(); },0);
    }
    function play() {
      if (!state) return;
      if (state.status === 'playing') { pause(); return; }
      if (state.status === 'ended') { state.index = state.first; state.cursor = state.from; }
      if (state.status === 'paused' && utterance && synth.paused) {
        clearTimeout(pauseTimer); hideNotice(); state.status = 'playing'; update();
        try { synth.resume(); } catch { speakCurrent(); return; }
        if (!synth.speaking && !synth.pending) speakCurrent();
      } else speakCurrent();
    }
    function seek(index) {
      if (!state) return;
      const playing = state.status === 'playing';
      cancel(); state.index = Math.max(state.first,Math.min(state.last,Number(index)||0));
      state.cursor = Math.max(state.from,state.parts[state.index].start); state.status = 'paused'; update(); hideNotice();
      if (playing) speakCurrent();
    }
    function range(which, value) {
      const playing = state.status === 'playing'; cancel(); state.selected = false;
      state[which] = Number(value);
      if (state.first > state.last) state[which === 'first' ? 'last' : 'first'] = state[which];
      state.from = state.parts[state.first].start; state.to = state.parts[state.last].end;
      state.index = state.first; state.cursor = state.from; state.status = 'paused'; update(); hideNotice();
      if (playing) speakCurrent();
    }
    function reset() {
      if (!state) return;
      cancel(); state.index = state.first; state.cursor = state.from; state.hasPlayed = false; state.status = 'idle'; update(); hideNotice();
    }
    function stop() { cancel(); state = null; view = null; selection = null; pointerSelection = null; hideNotice(); }
    function mount(button, explicitText) {
      const text = String(explicitText ?? source(button)).trim(), parts = sentences(text);
      if (!parts.length) return;
      if (!state || state.text !== text) {
        stop(); state = {text,parts,first:0,last:parts.length-1,index:0,cursor:parts[0].start,from:parts[0].start,to:parts.at(-1).end,status:'idle',rate:/hskReadPassage/.test(button.getAttribute('onclick')||'') ? .75 : .85,selected:false};
      }
      // Native button text cannot reliably be dragged/long-pressed to select on browsers.
      // Keep word lookup keyboard-accessible while allowing ordinary text selection.
      passage(button)?.querySelectorAll('button.h2-word').forEach(original => {
        const word = document.createElement('span');
        for (const attribute of original.attributes) if(attribute.name!=='type')word.setAttribute(attribute.name,attribute.value);
        word.setAttribute('role','button');word.tabIndex=0;word.dataset.readingSelectable='true';
        word.textContent=original.textContent;original.replaceWith(word);
      });
      const box = document.createElement('section'); box.className = 'reading-audio-player'; box.setAttribute('aria-label','Điều khiển nghe bài đọc');
      const actions = document.createElement('div'); actions.className = 'reading-audio-actions';
      button.before(box); actions.append(button); box.append(actions);
      const makeButton = (label, fn) => {const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;actions.append(b);return b;};
      const previous=makeButton('⏮ Câu trước',()=>seek(state.index-1)),next=makeButton('Câu sau ⏭',()=>seek(state.index+1));
      makeButton('↺ Về đầu',reset);
      const controls=document.createElement('div');controls.className='reading-audio-range';box.append(controls);
      const makeSelect=(label,which)=>{const wrap=document.createElement('label'),select=document.createElement('select');wrap.textContent=label+' ';select.setAttribute('aria-label',label);parts.forEach((p,i)=>select.add(new Option(`Câu ${i+1}`,String(i))));select.onchange=()=>range(which,select.value);wrap.append(select);controls.append(wrap);return select;};
      const start=makeSelect('Từ câu','first'),end=makeSelect('Đến câu','last');
      const slider=document.createElement('input');slider.type='range';slider.step='1';slider.setAttribute('aria-label','Vị trí nghe theo câu');slider.oninput=()=>{write(position,`Chuyển đến câu ${Number(slider.value)+1}/${parts.length}`);write(preview,parts[Number(slider.value)].text);};slider.onchange=()=>seek(slider.value);box.append(slider);
      const position=document.createElement('p');position.className='reading-audio-position';position.setAttribute('role','status');box.append(position);
      const preview=document.createElement('p');preview.lang='zh-CN';preview.className='reading-audio-preview';box.append(preview);
      const selected=makeButton('Nghe phần bôi đen',()=>{
        const chosen=selection||pointerSelection;if(!chosen)return;pointerSelection=null;cancel();state.selected=true;state.from=chosen.start;state.to=chosen.end;
        state.first=parts.findIndex(p=>p.end>state.from);state.last=parts.findLastIndex(p=>p.start<state.to);state.index=state.first;state.cursor=state.from;state.status='paused';speakCurrent();
      });
      const tip=document.createElement('p');tip.className='reading-audio-tip';tip.textContent='Chọn câu hoặc kéo thanh để chuyển vị trí. Bôi đen chữ trong bài rồi bấm “Nghe phần bôi đen”.';box.append(tip);
      // Preserve a text selection when a mouse user presses the selection-play control.
      selected.addEventListener('pointerdown',e=>{if(selection){pointerSelection=selection;e.preventDefault();}});
      selected.addEventListener('pointercancel',()=>{pointerSelection=null;if(view)view.selection.disabled=!selection&&!pointerSelection;});
      view={box,play:button,previous,next,start,end,slider,position,preview,selection:selected};selection=null;button.dataset.readingAudioMounted='true';update();
    }
    function decorate() {
      const button=document.querySelector(selector);
      if (!button) { if(state)stop(); return; }
      if (!button.closest('.reading-audio-player')) mount(button);
      else if (view && !view.box.isConnected) mount(button);
    }
    // Preserve drag selection across individual interactive word spans on desktop.
    let drag=null, suppressWordClick=false;
    const caret=(x,y)=>{
      if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);if(p)return {node:p.offsetNode,offset:p.offset};}
      const r=document.caretRangeFromPoint?.(x,y);return r?{node:r.startContainer,offset:r.startOffset}:null;
    };
    const extendDrag=(x,y)=>{
      const point=caret(x,y);if(!point||!drag.element.contains(point.node))return;
      window.getSelection()?.setBaseAndExtent(drag.anchor.node,drag.anchor.offset,point.node,point.offset);
    };
    document.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0||!view)return;
      const element=passage(view.play);if(!element?.contains(event.target))return;
      const anchor=caret(event.clientX,event.clientY);if(!anchor||!element.contains(anchor.node))return;
      drag={element,anchor,x:event.clientX,y:event.clientY,moved:false};window.getSelection()?.collapse(anchor.node,anchor.offset);event.preventDefault();
    },true);
    document.addEventListener('pointermove',event=>{
      if(!drag||!(event.buttons&1))return;
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4)drag.moved=true;
      if(drag.moved){event.preventDefault();extendDrag(event.clientX,event.clientY);}
    },true);
    document.addEventListener('pointerup',event=>{
      if(!drag)return;
      if(drag.moved){extendDrag(event.clientX,event.clientY);event.preventDefault();suppressWordClick=true;setTimeout(()=>suppressWordClick=false,0);}
      drag=null;
    },true);
    document.addEventListener('pointercancel',()=>{drag=null;});
    document.addEventListener('click',event=>{
      if(suppressWordClick){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    document.addEventListener('selectionchange',()=>{
      const selected=window.getSelection(),textElement=view&&passage(view.play);
      selection=null;
      if (selected?.rangeCount && !selected.isCollapsed && textElement?.contains(selected.anchorNode) && textElement.contains(selected.focusNode)) {
        const r=selected.getRangeAt(0),prefix=document.createRange();prefix.selectNodeContents(textElement);prefix.setEnd(r.startContainer,r.startOffset);
        let start=prefix.toString().length,end=start+r.toString().length;
        while(start<end&&/\s/.test(state.text[start]))start++;
        while(end>start&&/\s/.test(state.text[end-1]))end--;
        if(end>start&&state.text.slice(start,end).trim()===selected.toString().trim())selection={start,end};
      }
      if(view)view.selection.disabled=!selection&&!pointerSelection;
    });
    document.addEventListener('click',event=>{
      const button=event.target.closest?.(selector);if(!button)return;
      event.preventDefault();event.stopImmediatePropagation();
      if(!view||view.play!==button||!button.closest('.reading-audio-player'))mount(button);
      play();
    },true);
    document.addEventListener('keydown',event=>{
      if(!['Enter',' '].includes(event.key)||!event.target.matches?.('[data-reading-selectable]'))return;
      event.preventDefault();event.stopImmediatePropagation();window.getSelection()?.removeAllRanges();event.target.click();
    },true);
    new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
    window.addEventListener('pagehide',stop);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
    decorate();
    return {toggle(button,text,rate=.85){if(!button?.isConnected)return;if(!view||view.play!==button)mount(button,text);if(state){state.rate=Math.min(.95,Math.max(.65,Number(rate)||.85));play();}},interrupt(){pause(true);},stop};
  };
})();
