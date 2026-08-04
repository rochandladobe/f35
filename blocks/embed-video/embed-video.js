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

export default function decorate(block) {
  const items = [...block.children];
  block.dataset.count = items.length;

  items.forEach((row) => {
    row.classList.add('embed-video-item');

    const link = row.querySelector('a[href]');
    if (!link) return;

    row.textContent = '';

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'embed-video-frame';

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(videoWrapper, link.href);
      }
    });
    observer.observe(videoWrapper);
    row.append(videoWrapper);
  });
}
