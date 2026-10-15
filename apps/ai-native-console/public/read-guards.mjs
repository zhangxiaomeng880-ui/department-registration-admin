// Exact request ownership, including session epochs. Check before success,
// error/auth handling and finally cleanup, rather than only before rendering.
export const isCurrentRead=(request,view)=>
  request.sessionEpoch===view.sessionEpoch&&
  request.routeVersion===view.routeVersion&&
  request.nonce===view.nonce&&
  request.workspaceId===view.workspaceId&&
  request.projectId===view.projectId;

export const isCurrentAssetRead=(request,view)=>
  isCurrentRead(request,view)&&request.domain===view.domain&&
  view.page==='project'&&view.tab==='assets';

export const isCurrentKnowledgeRead=(request,view)=>
  isCurrentRead(request,view)&&view.page==='knowledge';

export const isCurrentProjectList=isCurrentRead;
