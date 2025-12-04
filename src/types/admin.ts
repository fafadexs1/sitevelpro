export type Plan = {
    id: string;
    type: "residencial" | "empresarial";
    speed: string;
    upload_speed: string | null;
    download_speed: string | null;
    price: number;
    original_price: number | null;
    first_month_price: number | null;
    features: string[] | null;
    highlight: boolean;
    has_tv: boolean;
    featured_channel_ids: string[] | null;
    whatsapp_number: string | null;
    whatsapp_message: string | null;
    conditions: string | null;
    sort_order: number;
};

export type TvChannel = {
    id: string;
    name: string;
    description: string | null;
    logo_url: string;
    created_at: string;
};
