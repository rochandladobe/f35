/*
 * cards-video — a grid of captioned, click-to-play video cards.
 * Each authored row is one video: cell 1 = poster thumbnail image, cell 2 =
 * caption + a link to the video (YouTube watch URL). Renders the poster with a
 * play button; clicking swaps in the lazy-loaded YouTube iframe (autoplay).
 * Source: f35.com "F-35 Capabilities" YouTube Shorts grid
 * (.youtube-shorts .video-placeholder).
 */

const youtubeId = (href) => {
  try {
    const url = new URL(href);
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/')[1];
    const parts = url.pathname.split('/');
    const i = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'vi');
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
  } catch (e) { /* ignore */ }
  return '';
};

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const link = row.querySelector('a[href]');
    if (!link) return;
    const id = youtubeId(link.getAttribute('href'));
    if (!id) return;

    // Poster = the row's image (fall back to the YouTube maxres still).
    const posterImg = row.querySelector('img');
    const poster = posterImg ? posterImg.getAttribute('src')
      : `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

    // Caption = a text paragraph that isn't the bare link URL.
    const caption = [...row.querySelectorAll('p')]
      .map((p) => p.textContent.trim())
      .find((t) => t && !t.startsWith('http')) || '';

    const li = document.createElement('li');

    const frame = document.createElement('div');
    frame.className = 'cards-video-frame';
    frame.style.backgroundImage = `url("${poster}")`;
    frame.setAttribute('role', 'button');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('aria-label', caption ? `Play video: ${caption}` : 'Play video');

    if (caption) {
      const cap = document.createElement('p');
      cap.className = 'cards-video-caption';
      cap.textContent = caption;
      frame.append(cap);
    }
    const play = document.createElement('span');
    play.className = 'cards-video-play';
    play.setAttribute('aria-hidden', 'true');
    frame.append(play);

    const playVideo = () => {
      if (frame.dataset.loaded === 'true') return;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`);
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', caption || 'Video');
      iframe.className = 'cards-video-iframe';
      frame.replaceChildren(iframe);
      frame.dataset.loaded = 'true';
    };
    frame.addEventListener('click', playVideo);
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); }
    });

    li.append(frame);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
