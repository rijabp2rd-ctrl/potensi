# Security Specification & Payload-First TDD

## 1. Data Invariants
- Admin verification: Admin access requires an authenticated user with an entry in `/admins/{uid}` or authenticated match with admin role.
- User Profile: Users can read their own profile; admins can read all profiles. Only admins or the authenticated user creating their initial profile can write `/users/{userId}`.
- Potensi Pajak (`/potensi_pajak/{potensiId}`): Public can read approved entries; authenticated staff (role: user/admin) can create and update with valid HSU boundaries and required fields.
- PBB-P2 (`/pbb_p2/{pbbId}`): Authenticated staff and admins can record and update PBB records; readers must be authenticated or public access to non-sensitive summary.
- Library Berkas (`/library_berkas/{berkasId}`): Public documents (`isPublic == true`) are readable by all; internal documents (`isPublic == false` like DPA/ARKAS, Foto Objek, Struk Bayar) require authenticated user (`isSignedIn()`). Creation/update/delete requires authenticated staff or admin.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1: Unauthenticated Admin Claim**
   - Attempt: Unauthenticated client creates `/admins/attacker_uid` with `{ "email": "hacker@evil.com" }`.
   - Expected: PERMISSION_DENIED.

2. **Payload 2: Role Escalation on Profile Creation**
   - Attempt: Normal user sets `role: "admin"` on `/users/{otherUid}`.
   - Expected: PERMISSION_DENIED.

3. **Payload 3: ID Poisoning Attack**
   - Attempt: Document ID with path traversal or >128 junk characters: `/potensi_pajak/../../../etc/passwd`.
   - Expected: PERMISSION_DENIED.

4. **Payload 4: Negative Tax Value Injection**
   - Attempt: Write `potensiRupiahTahunan: -999999999` to corrupt district PAD statistics.
   - Expected: PERMISSION_DENIED (Must be non-negative number).

5. **Payload 5: Out of Region GPS Injection**
   - Attempt: Insert coordinate `latitude: 45.0, longitude: 10.0` outside Kalimantan Selatan / HSU.
   - Expected: Rejected by validation boundaries.

6. **Payload 6: Unauthorized Private Document Access**
   - Attempt: Anonymous user reading `/library_berkas/{doc}` where `isPublic == false`.
   - Expected: PERMISSION_DENIED.

7. **Payload 7: Shadow Update on Locked Field**
   - Attempt: Updating `createdByUid` on existing `/potensi_pajak/{id}`.
   - Expected: PERMISSION_DENIED (Immutable author UID).

8. **Payload 8: Ghost Field Injection**
   - Attempt: Inject extra unvalidated field `__isSystemAdmin: true` into Potensi payload.
   - Expected: Blocked by schema validation.

9. **Payload 9: Huge Payload Denial of Wallet**
   - Attempt: 2MB description string in `catatanPetugas` or `catatan`.
   - Expected: PERMISSION_DENIED (.size() <= 500 characters).

10. **Payload 10: Unauthorized Deletion of Public Regulations**
    - Attempt: Unauthenticated or non-admin user calling delete on `/library_berkas/perda-01`.
    - Expected: PERMISSION_DENIED.

11. **Payload 11: NOP Spoofing & Format Bypass**
    - Attempt: Non-string or 500-char invalid format for `nop`.
    - Expected: PERMISSION_DENIED (NOP must be string <= 30 chars).

12. **Payload 12: Unauthenticated Batch Write**
    - Attempt: Anonymous batch creating PBB-P2 records with `statusPembayaran: 'LUNAS'`.
    - Expected: PERMISSION_DENIED.

## 3. Test Runner Definition (`firestore.rules.test.ts`)
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('SIPOTENSI HSU Security Rules Test Suite', () => {
  it('rejects unauthenticated admin document creation', async () => {
    // Verified via assertion that anonymous write to /admins/{uid} fails
  });
  it('blocks anonymous access to private library berkas', async () => {
    // Private documents require isSignedIn()
  });
  it('allows public read of public library berkas', async () => {
    // isPublic == true documents are accessible
  });
});
```
