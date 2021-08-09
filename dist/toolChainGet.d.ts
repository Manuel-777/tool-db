import ToolChain from ".";
/**
 * Triggers a GET request to other peers. If the data is available locally it will return that instead.
 * @param key key of the data
 * @param onRemote Weter or not to trigger on additional remote responses if data was found locally before that.
 * @returns Promise<Data>
 */
export default function toolChainGet<T = any>(this: ToolChain, key: string, userNamespaced?: boolean, timeoutMs?: number, onRemote?: boolean): Promise<T>;
