const guestOwnerStorageKey =
  "jungle-nft-marketplace:guest-owner";

export function getGuestOwnerId() {
  const storedOwnerId = localStorage.getItem(
    guestOwnerStorageKey,
  );

  if (storedOwnerId) {
    return storedOwnerId;
  }

  const ownerId = `guest-${crypto.randomUUID()}`;

  localStorage.setItem(
    guestOwnerStorageKey,
    ownerId,
  );

  return ownerId;
}
