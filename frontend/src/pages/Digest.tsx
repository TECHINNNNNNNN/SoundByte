import { useParams } from "react-router-dom";
import digestService from "../services/digest.service";
import { useEffect, useState } from "react";
import type { Digest } from "../services/digest.service";


const Digest = () => {

    const { digestId } = useParams();

    const [digest, setDigest] = useState<Digest | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const deliveries = digest?.deliveries;

    useEffect(() => {
        setIsLoading(true);
        const fetchDigest = async () => {
            const digest = await digestService.getDigest(digestId as string);
            setDigest(digest);
            setIsLoading(false);
        }
        fetchDigest();
    }, [digestId])

    if (isLoading) return <div>Loading...</div>
    if (!digest) return <div>Digest not found</div>


    return (
        <div>
            <h1>All the audios in the digest</h1>
            {deliveries?.map((delivery) => {
                return (
                    <div key={delivery.id}>
                        <h2>{delivery.id}</h2>
                        <audio src={delivery.audioUrl} controls />
                    </div>
                )
            })}
        </div>
    )
}

export default Digest;