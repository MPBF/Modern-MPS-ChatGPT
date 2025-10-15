import type { AuthUser } from "@/types";
import { hasPermission, type PermissionKey } from "../../../shared/permissions";

// Check if user has admin role
export function isUserAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  
  // Check if user has admin role (role_id 1 is typically admin)
  if (user.role_id === 1) return true;
  
  // Check if user has admin permission
  return hasPermission(user.permissions, 'admin');
}

// Check if user has specific permission(s)
export function userHasPermission(
  user: AuthUser | null,
  requiredPermissions: PermissionKey | PermissionKey[],
  requireAll: boolean = false
): boolean {
  if (!user) return false;
  
  // Admin bypasses all permission checks
  if (isUserAdmin(user)) return true;
  
  return hasPermission(user.permissions, requiredPermissions, requireAll);
}

// Check if user can edit content
export function hasEditPermissions(user: AuthUser | null): boolean {
  if (!user) return false;
  
  // Admin can edit everything
  if (isUserAdmin(user)) return true;
  
  // Check for any management permission
  const managementPermissions: PermissionKey[] = [
    'manage_orders',
    'manage_production',
    'manage_maintenance',
    'manage_quality',
    'manage_inventory',
    'manage_users',
    'manage_hr',
    'manage_settings',
    'manage_definitions',
    'manage_roles'
  ];
  
  return hasPermission(user.permissions, managementPermissions, false);
}

// Check if user can delete content
export function hasDeletePermissions(user: AuthUser | null): boolean {
  // Same as edit permissions for now
  return hasEditPermissions(user);
}

// Check if user can view a specific page/route
export function canAccessRoute(
  user: AuthUser | null,
  route: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (isUserAdmin(user)) return true;
  
  // Import route permissions from shared module
  const { ROUTE_PERMISSIONS } = require('../../../shared/permissions');
  
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // No specific permission required, allow access
    return true;
  }
  
  return hasPermission(user.permissions, requiredPermissions, false);
}

// Check if user can access a settings tab
export function canAccessSettingsTab(
  user: AuthUser | null,
  tabName: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (isUserAdmin(user)) return true;
  
  // Import settings tab permissions from shared module
  const { SETTINGS_TAB_PERMISSIONS } = require('../../../shared/permissions');
  
  const requiredPermissions = SETTINGS_TAB_PERMISSIONS[tabName];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // No specific permission required, allow access
    return true;
  }
  
  return hasPermission(user.permissions, requiredPermissions, false);
}

// Get user's role display name
export function getUserRoleName(user: AuthUser | null): string {
  if (!user) return 'غير مسجل';
  
  if (user.role_name_ar) return user.role_name_ar;
  if (user.role_name) return user.role_name;
  if (user.role_id === 1) return 'مدير النظام';
  
  return 'مستخدم';
}

// Check if user has any management permissions
export function isManager(user: AuthUser | null): boolean {
  if (!user) return false;
  
  if (isUserAdmin(user)) return true;
  
  const managerPermissions: PermissionKey[] = [
    'manage_orders',
    'manage_production',
    'manage_maintenance',
    'manage_quality',
    'manage_inventory',
    'manage_users',
    'manage_hr'
  ];
  
  return hasPermission(user.permissions, managerPermissions, false);
}

// Check if user can view reports
export function canViewReports(user: AuthUser | null): boolean {
  if (!user) return false;
  
  return userHasPermission(user, 'view_reports');
}

// Check if user can manage definitions
export function canManageDefinitions(user: AuthUser | null): boolean {
  if (!user) return false;
  
  return userHasPermission(user, 'manage_definitions');
}

// Check if user can manage users
export function canManageUsers(user: AuthUser | null): boolean {
  if (!user) return false;
  
  return userHasPermission(user, 'manage_users');
}

// Check if user can manage roles
export function canManageRoles(user: AuthUser | null): boolean {
  if (!user) return false;
  
  return userHasPermission(user, ['manage_roles', 'admin']);
}