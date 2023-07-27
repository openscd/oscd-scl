import { expect } from '@open-wc/testing';

import { validScl } from './validScl.js';

import { find, isPublic, selectorTags } from './find.js';
import { identity } from './identity.js';

const doc = new DOMParser().parseFromString(validScl, 'application/xml')!;

describe('Function returning query selector', () => {
  it('returns negation pseudo-class for identity of type NaN', () =>
    expect(find(doc, 'Association', NaN)).to.be.null);

  it('returns tagName with non SCL tag', () =>
    expect(find(doc, 'LNodeSpec', 'someLNodeSpec')).to.be.null);

  it('returns null for invalid extRefIdentity with non SCL tag', () => {
    expect(find(doc, 'ExtRef', '@intAddr5]')).to.be.null;
    expect(find(doc, 'ExtRef', ':GCB CBSW/ LLN0   /  2  stVal')).to.be.null;
    expect(find(doc, 'Substation', 'IED1')).to.be.null;
  });

  it('returns null for invalid iEDNameIdentity with non SCL tag', () =>
    expect(find(doc, 'IEDName', '@invalidId]')).to.be.null);

  it('returns null for invalid pIdentity with non SCL tag', () => {
    expect(find(doc, 'P', '@invalidId')).to.be.null;
    expect(find(doc, 'P', 'IED1 P1> [0]')).to.be.null;
  });

  it('returns null for invalid protNsIdentity with non SCL tag', () =>
    expect(find(doc, 'ProtNs', '@invalidId')).to.be.null);

  it('returns null for invalid valIdentity with non SCL tag', () =>
    expect(find(doc, 'Val', '@invalidId')).to.be.null);

  it('returns null for LNode identity without lnType', () =>
    expect(find(doc, 'LNode', '(IED1)')).to.be.null);

  it('returns null for LNode identity without lnType', () => {
    expect(find(doc, 'DAI', 'stVal')).to.be.null;
  });

  it('returns correct element for all tags', () => {
    Object.keys(selectorTags).forEach(tag => {
      const elements = Array.from(doc.querySelectorAll(tag)).filter(
        item => !item.closest('Private')
      );

      elements.forEach(element => {
        if (element && isPublic(element))
          expect(element).to.satisfy(
            // eslint-disable-next-line no-shadow
            (element: Element) => element === find(doc, tag, identity(element))
          );
      });
    });
  });
});
