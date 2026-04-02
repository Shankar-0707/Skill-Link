import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrganisationsService } from './organisations.service';
import {
  UpdateOrganisationDto,
  ListOrganisationsDto,
} from './organisation.dto';
import * as common from '../common';
import { CurrentUser, Roles, RolesGuard } from '../common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Organisations')
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  // Public endpoints
  // Admin kke liye h ye route
  @Get()
  @ApiOperation({ summary: 'List All Active organisations (public)' })
  @ApiOkResponse({ description: 'Paginated List of organisations' })
  findAll(@Query() query: ListOrganisationsDto & common.PaginationDto) {
    return this.organisationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single organisation with its products (public)',
  })
  @ApiOkResponse({ description: 'Organisation detail with products' })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organisationsService.findOne(id);
  }

  // Authenticated: Organisation-only endpoints

  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated organisation's own profile" })
  @ApiOkResponse({ description: 'Own organisation profile' })
  getMyProfile(@common.CurrentUser() user: common.JwtPayload) {
    return this.organisationsService.findMyProfile(user.sub);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, RolesGuard)
  @Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update the authenticated organisation's profile" })
  @ApiOkResponse({ description: 'Updated organisation profile' })
  @ApiForbiddenResponse({
    description: 'Only ORGANISATION role can access this',
  })
  updateMyProfile(
    @CurrentUser() user: common.JwtPayload,
    @Body() dto: UpdateOrganisationDto,
  ) {
    return this.organisationsService.update(user.sub, dto);
  }
}
