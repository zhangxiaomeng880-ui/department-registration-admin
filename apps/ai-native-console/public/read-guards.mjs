// Route-bound read guard. A response is valid only for the exact selected view
// and the latest request, never merely because its HTTP call succeeded.
export const isCurrentAssetRead=(request,view)=>
  request.routeVersion===view.routeVersion&&
  request.nonce===view.nonce&&
  request.projectId===view.projectId&&
  request.domain===view.domain&&
  view.page==='project'&&view.tab==='assets';

export const isCurrentKnowledgeRead=(request,view)=>
  request.routeVersion===view.routeVersion&&
  request.nonce===view.nonce&&
  request.workspaceId===view.workspaceId&&
  request.projectId===view.projectId&&
  view.page==='knowledge';
