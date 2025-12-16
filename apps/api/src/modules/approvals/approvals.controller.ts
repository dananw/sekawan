import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CurrentUser, Roles } from '../../common/decorators';

@ApiTags('Approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  @Roles('APPROVER_L1', 'APPROVER_L2', 'ADMIN')
  @ApiOperation({ summary: 'Get pending approvals for current user' })
  async findPending(@CurrentUser() user: any) {
    return this.approvalsService.findPendingForUser(user.sub, user.role);
  }

  @Get('pending/count')
  @Roles('APPROVER_L1', 'APPROVER_L2', 'ADMIN')
  @ApiOperation({ summary: 'Get count of pending approvals' })
  async countPending(@CurrentUser() user: any) {
    return this.approvalsService.countPendingForUser(user.sub, user.role);
  }

  @Get('history')
  @Roles('APPROVER_L1', 'APPROVER_L2', 'ADMIN')
  @ApiOperation({ summary: 'Get approval history for current user' })
  async findHistory(@CurrentUser() user: any) {
    return this.approvalsService.findHistory(user.sub, user.role);
  }
}
