# Shared conceptual governance models

These models are conceptual contracts. They are subordinate to `AGENTS.md` and `DESIGN.md` and do not override SPFx, SharePoint, Graph, Purview or security constraints.

## SiteCollection

- id, url, title, template, hubSiteId, storageUsedGb, storageQuotaGb, lifecycleState, criticality, lastActivityDate, lastScannedAt.

## TeamConnectedSite

- siteId, teamId, groupId, channelType, isPrivateChannel, isSharedChannel, owners, membershipSource.

## SiteOwner

- userId, displayName, email, active, ownerType, lastValidatedAt, validationStatus.

## GovernanceRisk

- id, entityType, entityId, severity, confidence, evidence, sourceSystem, status, exceptionUntil.

## GovernanceRecommendation

- id, riskId, title, rationale, actionType, destructive, requiresApproval, backendRequired.

## StorageMetric

- siteId, libraryId, usedGb, quotaGb, versionStorageGb, growthRate, measuredAt.

## SharingRisk

- siteId, itemUrl, linkType, externalPrincipal, anonymous, severity, evidence.

## LifecycleState

- active, inactive, pendingOwnerValidation, archived, retained, candidateForRemoval, exception.

## ComplianceSignal

- entityId, signalType, sourceSystem, label, retentionState, legalHold, confidence.

## AuditActivity

- activityId, actor, activityType, targetUrl, occurredAt, sourceSystem, correlationId.

## ContentOwner

- areaId, areaName, ownerUserId, delegateUserIds, reviewCadence, lastReviewedAt.

## GovernanceAction

- actionId, actionType, mode, requestedBy, approvedBy, scope, impactSummary, auditLogId.

## ReviewRequest

- requestId, campaignId, targetEntityId, ownerId, dueDate, status, response, decidedAt.
