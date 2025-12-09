export interface OrderDetail {
    voucher_group_id: number;
    quantity_voucher: number;
    site_id: string;
    region_id: string;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: string;
    total: number;
    status: string;
    created_date: string;
    details: OrderDetail[];
}
