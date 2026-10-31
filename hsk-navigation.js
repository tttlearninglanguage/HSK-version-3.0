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
      if (view) document.body.dataset.hskStudyView = view;
      else delete document.body.dataset.hskStudyView;
      return result;
    };
  }
})();
