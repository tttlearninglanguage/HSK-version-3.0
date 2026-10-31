/* Track study views so only their mobile navigation scrolls with the page. */
(() => {
  const views = {
    renderLesson: 'lesson',
    topicOpen: 'topic',
    home: '',
    topicHome: '',
    showStats: '',
    showReview: ''
  };
  for (const [name, view] of Object.entries(views)) {
    const render = window[name];
    if (typeof render !== 'function') continue;
    window[name] = function (...args) {
      const result = render.apply(this, args);
      const header = document.getElementById('hsk-site-header');
      if (view) {
        document.body.dataset.hskStudyView = view;
        const source = view === 'topic' ? document.getElementById('topicRoot') : document.documentElement;
        const property = view === 'topic' ? '--topic-color' : '--accent';
        const accent = source && getComputedStyle(source).getPropertyValue(property).trim();
        if (header && accent) header.style.setProperty('--hsk-nav-accent', accent);
      } else {
        delete document.body.dataset.hskStudyView;
        if (header) header.style.removeProperty('--hsk-nav-accent');
      }
      return result;
    };
  }
})();
