/**
 * hero-masthead — full-bleed masthead hero.
 * The first row holds the background media: either a <picture> (still image) or
 * a link to a video file (.mp4/.webm). When it's a video, rebuild it as an
 * autoplay/muted/loop background <video> and surface a "Watch the video" link
 * out to the file (so the source is reachable directly / for reduced-motion).
 * @param {Element} block
 */
export default function decorate(block) {
  const mediaRow = block.querySelector(':scope > div:first-child');
  const videoLink = mediaRow
    ? mediaRow.querySelector('a[href$=".mp4"], a[href$=".webm"], a[href*=".mp4?"], a[href*=".webm?"]')
    : null;

  if (videoLink) {
    const src = videoLink.getAttribute('href');
    const mediaCell = videoLink.closest('div') || mediaRow;

    // Build the looping, muted background video (autoplay requires muted).
    const video = document.createElement('video');
    video.className = 'hero-masthead-video';
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    const source = document.createElement('source');
    source.setAttribute('src', src);
    source.setAttribute('type', src.endsWith('.webm') ? 'video/webm' : 'video/mp4');
    video.append(source);

    mediaCell.replaceChildren(video);

    // Link out to the video file, shown in the content panel below the CTA(s).
    const contentCell = block.querySelector(':scope > div:last-child > div')
      || block.querySelector(':scope > div:last-child');
    if (contentCell) {
      const p = document.createElement('p');
      p.className = 'hero-masthead-video-link';
      const out = document.createElement('a');
      out.setAttribute('href', src);
      out.setAttribute('target', '_blank');
      out.setAttribute('rel', 'noopener');
      out.textContent = 'Watch the video';
      p.append(out);
      contentCell.append(p);
    }
    return;
  }

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
