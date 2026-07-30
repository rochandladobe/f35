import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-news-card-image';
      else div.className = 'cards-news-card-body';
    });

    const image = li.querySelector('.cards-news-card-image');
    const body = li.querySelector('.cards-news-card-body');
    if (image && body) {
      /* first paragraph (date) becomes an overlay tag on the image */
      const date = body.querySelector('p');
      if (date && !date.querySelector('a')) {
        date.className = 'cards-news-tag';
        image.append(date);
      }
      /* last paragraph holding the link is the "Read More" action */
      const links = [...body.querySelectorAll('p')].filter((p) => p.querySelector('a'));
      const readMore = links[links.length - 1];
      if (readMore) readMore.className = 'cards-news-readmore';
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
