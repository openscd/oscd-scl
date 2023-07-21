import { expect } from '@open-wc/testing';

import { identity } from './identity.js';
import { validScl } from './validScl.js';

const scl = new DOMParser().parseFromString(validScl, 'application/xml');

describe('identity', () => {
  it('returns NaN for element null', () => expect(identity(null)).to.be.NaN);

  it('returns NaN for non SCL element', () =>
    expect(identity(scl.querySelector('Elem'))).to.be.NaN);

  it('returns NaN for any private element', () =>
    expect(identity(scl.querySelector('Private'))).to.be.NaN);

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
        'IED1>>CircuitBreaker_CB1>GCB>IED2 P1 CircuitBreaker_CB1/ CSWI 1',
      FCDA: 'IED1>>CircuitBreaker_CB1>GooseDataSet1>CircuitBreaker_CB1/ XCBR 1.Pos stVal (ST)',
      ExtRef:
        'IED1>>Disconnectors>DC CSWI 1>GOOSE:GCB CBSW/ LLN0  IED2 CBSW/ XSWI 2 Pos stVal@intAddr',
      'ExtRef:not([iedName])': 'IED1>>Disconnectors>DC CSWI 1>stVal-t[0]',
      LN: 'IED1>>CircuitBreaker_CB1> XCBR 1',
      ClientLN:
        'IED2>>CBSW> XSWI 1>ReportCb>IED1 P1 CircuitBreaker_CB1/ XCBR 1',
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
