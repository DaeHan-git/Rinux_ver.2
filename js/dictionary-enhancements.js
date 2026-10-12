(() => {
  const CLOSED_BOOK = '/manus-storage/async-images/mIsCv0vvv7m4CXBEc07bDW/image-1.webp';
  const OPEN_BOOK = '/manus-storage/async-images/mIsCv0vvv7m4CXBEc07bDW/image-2.webp';
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
  let introTimer;
  let activeLetter = '';

  function getSearchInput() {
    return document.getElementById('searchInput');
  }

  function hideIntro() {
    const layer = document.querySelector('.intro-layer');
    if (!layer) return;
    window.clearTimeout(introTimer);
    layer.classList.add('is-hiding');
    document.body.classList.remove('intro-visible');
    window.setTimeout(() => layer.remove(), 700);
  }

  function showIntro() {
    document.querySelector('.intro-layer')?.remove();
    const layer = document.createElement('section');
    layer.className = `intro-layer${REDUCED_MOTION.matches ? ' is-reduced' : ''}`;
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-label', '리눅스 명령어 사전 인트로');
    layer.innerHTML = `
      <p class="intro-topline">LINUX COMMAND LEXICON · VOL. 01</p>
      <button class="intro-skip" type="button">건너뛰기</button>
      <div class="intro-stage">
        <div class="intro-book-wrap" aria-hidden="true">
          <img class="intro-book intro-book--closed" src="${CLOSED_BOOK}" alt="">
          <span class="intro-page"></span>
          <img class="intro-book intro-book--open" src="${OPEN_BOOK}" alt="">
        </div>
        <div class="intro-copy">
          <p>OPEN THE REFERENCE</p>
          <h2>리눅스 명령어 사전</h2>
          <span>필요한 명령어를, 가장 빠르게 찾아보세요.</span>
        </div>
      </div>`;
    layer.querySelector('.intro-skip').addEventListener('click', hideIntro);
    document.body.prepend(layer);
    document.body.classList.add('intro-visible');
    introTimer = window.setTimeout(hideIntro, REDUCED_MOTION.matches ? 180 : 4300);
  }

  function setSearch(value) {
    const input = getSearchInput();
    if (!input) return;
    activeLetter = '';
    input.value = value;
    if (typeof window.setSearchAndRender === 'function') {
      window.setSearchAndRender();
    } else {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    updateSearchStatus();
  }

  function applyLetterFilter() {
    if (!activeLetter) return;
    document.querySelectorAll('#cardsGrid .card').forEach((card) => {
      const heading = card.querySelector('.cmd-name')?.textContent.trim().toUpperCase() || '';
      card.style.display = heading.startsWith(activeLetter) ? '' : 'none';
    });
  }

  function filterByLetter(letter) {
    const input = getSearchInput();
    if (!input) return;
    activeLetter = letter;
    input.value = '';
    if (typeof window.setSearchAndRender === 'function') window.setSearchAndRender();
    window.setTimeout(() => {
      decorateCards();
      applyLetterFilter();
      updateSearchStatus();
    }, 0);
  }

  function updateSearchStatus() {
    const status = document.getElementById('searchStatus');
    const input = getSearchInput();
    const cards = [...document.querySelectorAll('#cardsGrid .card')];
    if (!status || !input) return;
    const visible = cards.filter((card) => getComputedStyle(card).display !== 'none').length;
    const keyword = input.value.trim();
    status.innerHTML = activeLetter
      ? `<strong>${activeLetter}</strong> 색인 결과 · ${visible}개 표제어`
      : keyword
      ? `<strong>${keyword}</strong> 표제어 검색 결과 · ${visible}개 항목`
      : `총 <strong>${cards.length}</strong>개 표제어를 탐색할 수 있습니다.`;
  }

  function createAlphabetIndex() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;
    const index = document.createElement('nav');
    index.className = 'dictionary-index';
    index.setAttribute('aria-label', '명령어 알파벳 색인');
    index.innerHTML = '<span class="index-label">ALPHA INDEX</span><div class="index-letters"></div>';
    const group = index.querySelector('.index-letters');
    const allButton = document.createElement('button');
    allButton.className = 'index-letter is-active';
    allButton.type = 'button';
    allButton.textContent = 'ALL';
    allButton.title = '전체 표제어 보기';
    allButton.addEventListener('click', () => {
      setSearch('');
      group.querySelectorAll('.index-letter').forEach((button) => button.classList.remove('is-active'));
      allButton.classList.add('is-active');
    });
    group.append(allButton);

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
      const button = document.createElement('button');
      button.className = 'index-letter';
      button.type = 'button';
      button.textContent = letter;
      button.setAttribute('aria-label', `${letter}로 시작하는 명령어 찾기`);
      button.addEventListener('click', () => {
        filterByLetter(letter);
        group.querySelectorAll('.index-letter').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
      group.append(button);
    });
    heroSubtitle.after(index);
  }

  function decorateCards() {
    document.querySelectorAll('#cardsGrid .card').forEach((card) => {
      const heading = card.querySelector('.cmd-name')?.textContent.trim();
      if (heading) card.dataset.letter = heading.slice(0, 1).toUpperCase();
    });
  }

  function enhanceNavigation() {
    const actions = document.querySelector('.nav-actions');
    if (!actions || document.querySelector('.btn-replay')) return;
    const replay = document.createElement('button');
    replay.className = 'btn-secondary btn-replay';
    replay.type = 'button';
    replay.textContent = '사전 펼치기';
    replay.addEventListener('click', showIntro);
    actions.prepend(replay);
  }

  function initialize() {
    createAlphabetIndex();
    enhanceNavigation();
    const status = document.createElement('p');
    status.id = 'searchStatus';
    status.className = 'search-status';
    status.setAttribute('aria-live', 'polite');
    document.querySelector('.toolbar')?.after(status);
    decorateCards();
    updateSearchStatus();
    getSearchInput()?.addEventListener('input', () => {
      activeLetter = '';
      document.querySelectorAll('.index-letter').forEach((button, index) => button.classList.toggle('is-active', index === 0));
      window.setTimeout(() => {
        decorateCards();
        updateSearchStatus();
      }, 0);
    });
    new MutationObserver(() => {
      decorateCards();
      applyLetterFilter();
      updateSearchStatus();
    }).observe(document.getElementById('cardsGrid'), { childList: true, subtree: true });
    showIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
