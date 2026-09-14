import {describe, expect, it} from 'vitest';
import {buildLeadSubmitFailureResponse} from '@/features/leads/error-response';

describe('buildLeadSubmitFailureResponse', () => {
  it('never exposes diagnostic details to the client', () => {
    expect(buildLeadSubmitFailureResponse()).toEqual({
      ok: false,
      error: 'submit_failed'
    });
    expect(buildLeadSubmitFailureResponse()).not.toHaveProperty('diagnostic');
  });
});
