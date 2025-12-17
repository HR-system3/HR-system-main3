import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class EmployeeHelperService {
  constructor(
    @Inject(forwardRef(() => EmployeeProfileService))
    private readonly employeeProfileService: EmployeeProfileService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get employeeId from userId by matching email
   * This is a workaround since User and EmployeeProfile are separate entities
   */
  async getEmployeeIdFromUserId(userId: string): Promise<string | null> {
    try {
      const user = await this.usersService.findById(userId);
      if (!user || !user.email) {
        return null;
      }

      // Try to find EmployeeProfile by personalEmail or workEmail
      // Note: This assumes email matching - in production, you'd want a direct link
      const profile = await this.employeeProfileService.getByEmployeeNumber(userId);
      if (profile) {
        return (profile as any)._id?.toString() || null;
      }

      // Alternative: search by email if we had a method for it
      // For now, return null and let the controller use the fallback
      return null;
    } catch (error) {
      console.error('Error getting employeeId from userId:', error);
      return null;
    }
  }
}

