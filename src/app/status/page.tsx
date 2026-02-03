import { getLayoutData } from "@/lib/data/get-layout-data";
import StatusPageClient from "./StatusPageClient";

export const metadata = {
    title: 'Status - Velpro Telecom',
    description: 'Verifique o status da nossa rede e serviços em tempo real.',
};

export default async function StatusPage() {
    const { domainType, companyLogoUrl } = await getLayoutData();

    return <StatusPageClient domainType={domainType} companyLogoUrl={companyLogoUrl} />;
}
