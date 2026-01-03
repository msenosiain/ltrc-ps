export function getPlayerPhotoUrl(playerId: string): string {
  return `http://localhost:3000/api/players/${playerId}/photo`;
}
