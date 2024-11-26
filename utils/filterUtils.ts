import { Order, FilterTypes } from '../types/order';

type SortField = FilterTypes['SortField'];
type SortOrder = FilterTypes['SortOrder'];
type StatusFilter = FilterTypes['StatusFilter'];

export const getFilteredAndSortedOrders = (
  orders: Order[],
  statusFilter: StatusFilter,
  sortField: SortField,
  sortOrder: SortOrder,
  isExpired: (order: Order) => boolean
) => {
  return orders
    .filter((order) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return order.status === 'active';
      if (statusFilter === 'returned') return order.status === 'completed';
      if (statusFilter === 'overdue') return isExpired(order);
      return true;
    })
    .sort((a, b) => {
      let compareA: string;
      let compareB: string;

      switch (sortField) {
        case 'assignedBy':
          compareA = a.userId.name.toLowerCase();
          compareB = b.userId.name.toLowerCase();
          break;
        case 'assignedTo':
          compareA = a.customerId.name.toLowerCase();
          compareB = b.customerId.name.toLowerCase();
          break;
        case 'status':
          compareA = a.status;
          compareB = b.status;
          break;
        case 'toolName':
          compareA = a.toolName.toLowerCase();
          compareB = b.toolName.toLowerCase();
          break;
        default:
          compareA = a.toolName.toLowerCase();
          compareB = b.toolName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return compareA.localeCompare(compareB);
      } else {
        return compareB.localeCompare(compareA);
      }
    });
};