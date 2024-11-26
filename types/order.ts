// types/order.ts
export interface Order {
    _id: string;
    nfcId: string;
    toolName: string;
    customerId: {
      _id: string;
      name: string;
      companyName: string;
    };
    userId: {
      _id: string;
      name: string;
      companyName: string;
    };
    timeDuration: number;
    orderId: string;
    createdAt: string;
    expiryDate: string;
    status: "active" | "completed" | "cancelled";
    returnDate?: string;
  }
  
  export interface FilterTypes {
    SortField: 'assignedBy' | 'assignedTo' | 'status' | 'toolName';
    SortOrder: 'asc' | 'desc';
    StatusFilter: 'all' | 'active' | 'returned' | 'overdue';
  }
  export interface ActivityItem {
    id: string;
    type: "rental" | "return";
    toolName: string;
    userName: string;
    time: string;
  }