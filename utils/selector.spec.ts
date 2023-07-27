import { expect } from '@open-wc/testing';

import { selector, selectorTags } from './selector.js';
import { identity } from './identity.js';
import { validScl } from './validScl.js';

const doc = new DOMParser().parseFromString(validScl, 'application/xml')!;

describe('Function returning query selector', () => {
  it('returns negation pseudo-class for identity of type NaN', () =>
    expect(selector('Association', NaN)).to.equal(':not(*)'));

  it('returns tagName with non SCL tag', () =>
    expect(selector('LNodeSpec', 'someLNodeSpec')).to.equal('LNodeSpec'));

  it('returns correct selector for all tags except IEDName and ProtNs', () => {
    Object.keys(selectorTags).forEach(tag => {
      const elements = Array.from(doc.querySelectorAll(tag)).filter(
        item => !item.closest('Private')
      );

      elements.forEach(element => {
        if (element)
          expect(element).to.satisfy(
            // eslint-disable-next-line no-shadow
            (element: Element) =>
              element === doc.querySelector(selector(tag, identity(element)))
          );
      });
    });
  });
});
