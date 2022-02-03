import { ServersMessage, ToolDb } from "..";
import verifyPeer from "../utils/verifyPeer";

export default function handleServers(
  this: ToolDb,
  message: ServersMessage,
  remotePeerId: string
) {
  message.servers.forEach((peer) => {
    verifyPeer(peer).then((verified) => {
      // Add this peer to our list of peers
      if (verified) {
        const filteredPeers = this.peers.findIndex(
          (p) => p.adress === peer.adress
        );
        if (filteredPeers === -1) {
          // Add this peer to the list
          this.peers.push(peer);
        }
      }
    });
  });
}
