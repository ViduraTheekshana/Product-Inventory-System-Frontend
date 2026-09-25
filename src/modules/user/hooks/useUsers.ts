import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../common/toast/useToast";
import type { ApiError } from "../../../common/types/api.types";
import type { User, CreateUserRequest, AssignRoleRequest } from "../types/user.types";
import { getAllUsers, createUser, assignRole, suspendUser, reactivateUser, deleteUser } from "../api/userApi";

const PAGE_SIZE = 10;

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const { data, headers } = await getAllUsers(page, PAGE_SIZE, sort);
      setUsers(data.content);
      setTotalPages(data.page.totalPages);
      setTotalElements(data.page.totalElements);
      const warning = headers.get("X-Sort-Warning");
      if (warning) showToast({ type: "info", title: "Sort adjusted", message: warning, duration: 5000 });
    } catch (err) {
      setError(err as ApiError);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [page, sort, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(0); }, [sort]);

  async function create(request: CreateUserRequest) {
    await createUser(request);
    await fetchUsers({ silent: true });
    showToast({ type: "success", title: "User created", duration: 3000 });
  }

  async function changeRole(userId: string, request: AssignRoleRequest) {
    await assignRole(userId, request);
    await fetchUsers({ silent: true });
    showToast({ type: "success", title: "Role updated", duration: 3000 });
  }

  async function suspend(userId: string) {
    await suspendUser(userId);
    await fetchUsers({ silent: true });
    showToast({ type: "success", title: "User suspended", duration: 3000 });
  }

  async function reactivate(userId: string) {
    await reactivateUser(userId);
    await fetchUsers({ silent: true });
    showToast({ type: "success", title: "User reactivated", duration: 3000 });
  }

  async function remove(userId: string) {
    await deleteUser(userId);
    await fetchUsers({ silent: true });
    showToast({ type: "success", title: "User deleted", duration: 3000 });
  }

  return { users, page, setPage, totalPages, totalElements, sort, setSort, loading, error, create, changeRole, suspend, reactivate, remove };
}