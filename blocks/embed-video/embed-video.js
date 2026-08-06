/*
 * Embed (Video) Block
 * Renders a responsive grid of 16:9 video embeds (YouTube / Vimeo). Auto-sizes
 * to the number of videos (1-up, 2-up, or 3-up). Authored as one row per video:
 *
 *   | embed-video |
 *   | https://www.youtube.com/watch?v=XXXX |
 *   | https://www.youtube.com/watch?v=YYYY |
 *
 * Each row's first YouTube/Vimeo link becomes a lazily-loaded 16:9 embed.
 */

const getDefaultEmbed = (url) => `<iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
    scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy"></iframe>`;

const embedYoutube = (url) => {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  } else if (url.pathname.startsWith('/embed/')) {
    [, , vid] = url.pathname.split('/');
  }
  return `<iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>`;
};

const embedVimeo = (url) => {
  const [, video, hash] = url.pathname.split('/');
  const src = `https://player.vimeo.com/video/${video}${hash ? `?h=${hash}` : ''}`;
  return `<iframe src="${src}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
    frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Content from Vimeo" loading="lazy"></iframe>`;
};

const EMBEDS_CONFIG = [
  { match: ['youtube', 'youtu.be'], embed: embedYoutube },
  { match: ['vimeo'], embed: embedVimeo },
];

const loadEmbed = (wrapper, link) => {
  if (wrapper.dataset.embedLoaded === 'true') return;
  const url = new URL(link);
  const config = EMBEDS_CONFIG.find((e) => e.match.some((m) => link.includes(m)));
  wrapper.innerHTML = config ? config.embed(url) : getDefaultEmbed(url);
  wrapper.dataset.embedLoaded = 'true';
};

/** Extract a YouTube video id from any watch/embed/youtu.be/shorts URL. */
const youtubeId = (link) => {
  try {
    const url = new URL(link);
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/')[1];
    const parts = url.pathname.split('/');
    const i = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'vi');
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
  } catch (e) { /* ignore */ }
  return '';
};

export default function decorate(block) {
  const items = [...block.children];
  block.dataset.count = items.length;

  items.forEach((row) => {
    row.classList.add('embed-video-item');

    const link = row.querySelector('a[href]');
    if (!link) return;
    const { href } = link;

    row.textContent = '';

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'embed-video-frame';

    // Show a poster + play button immediately (reliable, fast); swap in the
    // real iframe on click. For YouTube we can build the poster from the video
    // id; otherwise we load the embed right away.
    const ytId = /youtu/i.test(href) ? youtubeId(href) : '';
    if (ytId) {
      videoWrapper.classList.add('embed-video-poster');
      videoWrapper.style.backgroundImage = `url("https://img.youtube.com/vi/${ytId}/maxresdefault.jpg")`;
      videoWrapper.setAttribute('role', 'button');
      videoWrapper.setAttribute('tabindex', '0');
      videoWrapper.setAttribute('aria-label', 'Play video');
      const play = document.createElement('span');
      play.className = 'embed-video-play';
      play.setAttribute('aria-hidden', 'true');
      videoWrapper.append(play);
      const start = () => loadEmbed(videoWrapper, href);
      videoWrapper.addEventListener('click', start);
      videoWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
      });
    } else {
      // Non-YouTube (e.g. Vimeo): load the embed immediately.
      loadEmbed(videoWrapper, href);
    }

    row.append(videoWrapper);
  });
}
