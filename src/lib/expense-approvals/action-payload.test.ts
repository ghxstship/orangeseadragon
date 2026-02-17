import { describe, expect, it } from 'vitest';
import {
  resolveApprovalComments,
  resolveApprovalRequestId,
  resolveApprovalRequestIds,
} from './action-payload';

describe('expense approval action payload helpers', () => {
  describe('resolveApprovalRequestId', () => {
    it('prefers id when present', () => {
      expect(resolveApprovalRequestId({ id: 'req-1', requestId: 'req-2' })).toBe('req-1');
    });

    it('falls back to requestId', () => {
      expect(resolveApprovalRequestId({ requestId: 'req-2' })).toBe('req-2');
    });

    it('trims and rejects empty values', () => {
      expect(resolveApprovalRequestId({ id: '   ' })).toBeNull();
      expect(resolveApprovalRequestId({ id: 123 })).toBeNull();
    });
  });

  describe('resolveApprovalRequestIds', () => {
    it('reads ids when provided', () => {
      expect(resolveApprovalRequestIds({ ids: ['a', 'b'] })).toEqual(['a', 'b']);
    });

    it('falls back to requestIds and filters invalid entries', () => {
      expect(
        resolveApprovalRequestIds({ requestIds: ['x', ' ', null, 4, 'y'] as unknown[] })
      ).toEqual(['x', 'y']);
    });

    it('returns empty array when neither list is valid', () => {
      expect(resolveApprovalRequestIds({ ids: 'not-an-array' })).toEqual([]);
    });
  });

  describe('resolveApprovalComments', () => {
    it('prefers reason over comments', () => {
      expect(resolveApprovalComments({ reason: 'Because', comments: 'Other' })).toBe('Because');
    });

    it('falls back to comments', () => {
      expect(resolveApprovalComments({ comments: 'Need updates' })).toBe('Need updates');
    });

    it('returns null for empty or invalid values', () => {
      expect(resolveApprovalComments({ reason: '   ' })).toBeNull();
      expect(resolveApprovalComments({ comments: 123 })).toBeNull();
    });
  });
});
