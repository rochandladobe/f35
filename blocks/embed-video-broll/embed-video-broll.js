/*
 * Embed (Video B-Roll) Block
 * Renders a responsive grid of video embeds (Vimeo / YouTube), each with an
 * optional download link below it. Authored as one row per video item:
 *
 *   | embed-video-broll |
 *   | https://vimeo.com/123 | Download F-35A B-Roll |
 *   | https://vimeo.com/456 | Download F-35B B-Roll |
 *   | https://vimeo.com/789 | Download F-35C B-Roll |
 *
 * The first Vimeo/YouTube link in a row becomes the 16:9 embed; any remaining
 * link becomes the download link. Videos are lazy-loaded on scroll.
 * https://www.hlx.live/developer/block-collection/embed
 */

const getDefaultEmbed = (url) => `<iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
    scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
  </iframe>`;

const embedYoutube = (url) => {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `<iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>`;
};

const embedVimeo = (url) => {
  // supports https://vimeo.com/{id} and https://vimeo.com/{id}/{hash}
  const [, video, hash] = url.pathname.split('/');
  const src = `https://player.vimeo.com/video/${video}${hash ? `?h=${hash}` : ''}`;
  return `<iframe src="${src}"
    style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
    frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
    title="Content from Vimeo" loading="lazy"></iframe>`;
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

  items.forEach((row) => {
    row.classList.add('embed-video-broll-item');

    const links = [...row.querySelectorAll('a')];
    if (!links.length) return;

    // The video is the first Vimeo/YouTube link; anything else is the download.
    const videoLink = links.find((a) => /vimeo|youtu/i.test(a.href)) || links[0];
    const downloadLink = links.find((a) => a !== videoLink);

    // Clear the authored cells; we rebuild a clean item structure.
    row.textContent = '';

    // 16:9 responsive video wrapper.
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'embed-video-broll-video';

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(videoWrapper, videoLink.href);
      }
    });
    observer.observe(videoWrapper);
    row.append(videoWrapper);

    // Optional download link below the video.
    if (downloadLink) {
      downloadLink.classList.remove('button');
      downloadLink.classList.add('embed-video-broll-download');
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'embed-video-broll-download-wrapper';
      linkWrapper.append(downloadLink);
      row.append(linkWrapper);
    }
  });

  block.classList.add('embed-video-broll-is-loaded');
}
