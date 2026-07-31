export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  // Distinguish the two promo instances on the homepage: "About the F-35" uses a
  // transparent pilot cutout on a blue gradient; "Fast Facts" uses a large photo
  // (homeFastFactsTakeoff) with a white border overhanging a grey panel. Tag the
  // Fast Facts variant so its distinct treatment can be scoped in CSS.
  const img = block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3');
  const isFastFacts = /fastfacts|fast-facts|takeoff|takoff|carrier/i.test(img?.getAttribute('src') || '')
    || /fast facts/i.test(heading?.textContent || '');
  if (isFastFacts) {
    block.classList.add('columns-promo-fastfacts');
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-promo-img-col');
        }
      }
    });
  });
}
