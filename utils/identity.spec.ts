import { expect } from '@open-wc/testing';

import { edgeScl } from './edgeScl.js';
import { identity } from './identity.js';
import { validScl } from './validScl.js';

const scl = new DOMParser().parseFromString(validScl, 'application/xml');
const sclEdge = new DOMParser().parseFromString(edgeScl, 'application/xml');

describe('identity', () => {
  it('returns NaN for element null', () => expect(identity(null)).to.be.NaN);

  it('returns NaN for non SCL element', () =>
    expect(identity(scl.querySelector('Elem'))).to.be.NaN);

  it('returns NaN for any private element', () =>
    expect(identity(scl.querySelector('Private'))).to.be.NaN);

  it('returns NaN for extension type PhysConn  element', () =>
    expect(identity(sclEdge.querySelector('PhysConn[type="SomeOtherType"]'))).to
      .be.NaN);

  it('returns NaN with orphan ExtRef element', () => {
    const extRef = new DOMParser()
      .parseFromString(`<ExtRef />`, 'application/xml')
      .querySelector('ExtRef')!;

    expect(identity(extRef)).to.be.NaN;
  });

  it('returns NaN with orphan Val element', () => {
    const val = new DOMParser()
      .parseFromString(`<Val />`, 'application/xml')
      .querySelector('Val')!;

    expect(identity(val)).to.be.NaN;
  });

  it('returns NaN with orphan PhysConn element', () => {
    const val = new DOMParser()
      .parseFromString(`<PhysConn />`, 'application/xml')
      .querySelector('PhysConn')!;

    expect(identity(val)).to.be.NaN;
  });

  it('returns NaN with orphan P element', () => {
    const val = new DOMParser()
      .parseFromString(`<P />`, 'application/xml')
      .querySelector('P')!;

    expect(identity(val)).to.be.NaN;
  });

  it('returns NaN with orphan ProtNs element', () => {
    const val = new DOMParser()
      .parseFromString(`<ProtNs />`, 'application/xml')
      .querySelector('ProtNs')!;

    expect(identity(val)).to.be.NaN;
  });

  it('returns parent identity for singleton identities', () => {
    const element = scl.querySelector('Server')!;
    expect(identity(element)).to.equal(identity(element.parentElement!));
  });

  it('returns valid identity for special identities', () => {
    const expectations: Partial<Record<string, string>> = {
      Hitem: '1\t143',
      Terminal: 'AA1>E1>COUPLING_BAY>QC11>AA1/E1/COUPLING_BAY/L2',
      'Bay>LNode': 'IED2 CBSW/ LPHD 1',
      KDC: 'IED1>IED1 P1',
      LDevice: 'IED1>>CircuitBreaker_CB1',
      IEDName:
        'IED1>>CircuitBreaker_CB1>GCB>IED2 P1 CircuitBreaker_CB1/ XCBR 1',
      FCDA: 'IED1>>CircuitBreaker_CB1>GooseDataSet1>CircuitBreaker_CB1/ XCBR 1.Pos stVal (ST)',
      ExtRef:
        'IED1>>Disconnectors>DC CSWI 1>GOOSE:GCB CBSW/ LLN0  IED2 CBSW/ XSWI 2 Pos stVal',
      'ExtRef[intAddr="stVal-t"]': 'IED1>>Disconnectors>DC CSWI 1>stVal-t[0]',
      LN: 'IED1>>CircuitBreaker_CB1> XCBR 1',
      ClientLN:
        'IED2>>CBSW> XSWI 1>ReportCb>IED1 P1 CircuitBreaker_CB1/DC XCBR 1',
      DAI: 'IED1>>CircuitBreaker_CB1> XCBR 1>Pos>ctlModel',
      SDI: 'IED1>>CircuitBreaker_CB1>CB CSWI 2>Pos>pulseConfig',
      Val: 'IED1>>CircuitBreaker_CB1> XCBR 1>Pos>ctlModel> 0',
      ConnectedAP: 'IED1 P1',
      GSE: 'CircuitBreaker_CB1 GCB',
      SMV: 'MU01 MSVCB01',
      PhysConn: 'IED1 P1>RedConn',
      P: 'IED1 P1>IP [0]',
      EnumVal: '#Dummy_ctlModel>0',
      ProtNs: '#Dummy.LLN0.Mod.SBOw>8-MMS\tIEC 61850-8-1:2003',
      Association: 'IED1>P1>IED3 MU01/ LLN0 ',
      LNode: 'IED2 CBSW/ XSWI 3',
      'SDI[ix="2"]': 'IED2>>CircuitBreaker_CB1> MHAN 1>HaAmp>har[2]',
    };

    Object.keys(expectations).forEach(key => {
      const element = scl.querySelector(key);
      expect(identity(element!)).to.equal(expectations[key]);
    });

    expect(identity(scl.querySelector('LNode[iedName="None"]'))).to.equal(
      'AA1>E1>COUPLING_BAY>(LLN0 Dummy.LLN0)'
    );
  });

  it('returns valid identity for naming identities', () => {
    const element = scl.querySelector('Substation')!;
    expect(identity(element)).to.equal(
      identity(element.parentElement!) +
        (element.parentElement?.tagName === 'SCL' ? '' : '>') +
        element.getAttribute('name')
    );
  });
});
