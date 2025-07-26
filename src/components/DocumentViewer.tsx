import React, { useRef } from 'react';
import Modal from './Modal';

// @ts-ignore - html2pdf.js doesn't have types
import html2pdf from 'html2pdf.js';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ isOpen, onClose, document }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!document) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const generateEnhancedPDF = () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    
    // Generate filename: {YYYYMMDD}_{FirstNameLastName}_{DocumentName}
    const today = new Date();
    const dateString = today.getFullYear().toString() + 
                      (today.getMonth() + 1).toString().padStart(2, '0') + 
                      today.getDate().toString().padStart(2, '0');
    
    // Extract full name from document content
    const content = document.content;
    let fullName = 'Unknown';
    if (content?.personalInfo?.firstName && content?.personalInfo?.lastName) {
      fullName = `${content.personalInfo.firstName}${content.personalInfo.lastName}`;
    }
    
    // Format document name
    const documentNameMap: { [key: string]: string } = {
      'will': 'LastWillandTestament',
      'living-trust': 'RevocableLivingTrust',
      'power-of-attorney': 'PowerofAttorney',
      'living-will': 'LivingWill'
    };
    
    const documentName = documentNameMap[document.document_type] || document.document_type.replace(/[^a-zA-Z0-9]/g, '');
    
    const fileName = `${dateString}_${fullName}_${documentName}.pdf`;
    
    // Store original styles
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    
    // Temporarily remove height restrictions and scrolling for PDF generation
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore original styles after PDF generation
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
    }).catch((error: any) => {
      console.error('PDF generation failed:', error);
      // Restore styles even if PDF generation fails
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
    });
  };

  const formatDocumentContent = () => {
    const content = document.content;
    
    if (document.document_type === 'will') {
      const fullName = content?.personalInfo?.firstName && content?.personalInfo?.lastName 
        ? `${content.personalInfo.firstName} ${content.personalInfo.lastName}`
        : 'Unknown';
      
      const city = content?.personalInfo?.address?.city || '_________________';

      return (
        <div className="space-y-6 text-black font-serif leading-relaxed">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-black mb-4 tracking-wider">
              LAST WILL AND TESTAMENT
            </h1>
            <div className="text-lg font-bold mb-2">OF</div>
            <div className="border-b border-black w-64 mx-auto mb-2"></div>
            <div className="text-lg font-bold">[{fullName}]</div>
          </div>

          {/* Opening Declaration */}
          <div className="mb-6 text-sm leading-relaxed">
            <p className="mb-4">
              I, <strong>{fullName}</strong>, a resident of <strong>{city}</strong>, California, being of sound and disposing mind and memory and over the age of eighteen (18) years, and not being actuated by any duress, menace, fraud, mistake, or undue influence, do make, publish, and declare this to be my last Will, hereby expressly revoking all Wills and Codicils previously made by me.
            </p>
          </div>

          {/* I. EXECUTOR */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">I. EXECUTOR</h2>
            <div className="text-sm leading-relaxed">
              {content?.executors && content.executors.length > 0 ? (
                <>
                  <p className="mb-2">
                    I appoint <strong>{content.executors[0]?.firstName} {content.executors[0]?.lastName}</strong> as Executor of this my Last Will and Testament{content.executors[1] ? ` and provide if this Executor is unable or unwilling to serve then I appoint ${content.executors[1]?.firstName} ${content.executors[1]?.lastName} as alternate Executor` : ''}.
                  </p>
                  <p>My Executor shall be authorized to carry out all provisions of this Will and pay my just debts, obligations and funeral expenses.</p>
                </>
              ) : (
                <p>I hereby appoint my designated Executor as named in this document to serve as Executor of this my Last Will and Testament.</p>
              )}
            </div>
          </div>

          {/* II. BEQUESTS */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">II. BEQUESTS</h2>
            <div className="text-sm leading-relaxed">
              <p className="mb-4">I give, devise, and bequeath my estate to the following beneficiaries:</p>
              
              {content?.beneficiaries && content.beneficiaries.length > 0 ? (
                content.beneficiaries.map((beneficiary: any, index: number) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="mb-2 font-semibold">
                      Beneficiary {index + 1}: {beneficiary.firstName} {beneficiary.lastName}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Relationship:</span> {beneficiary.relationship}
                      </div>
                      <div>
                        <span className="font-medium">Share:</span> {beneficiary.share || beneficiary.allocation + '%'} of my estate
                      </div>
                      {beneficiary.address && (
                        <div className="col-span-2">
                          <span className="font-medium">Address:</span> {beneficiary.address}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    I leave the entirety of my estate to my designated beneficiaries as specified in the attached schedules.
                  </p>
                </div>
              )}
              
              <p className="text-xs mt-4 italic text-gray-600">
                If any named beneficiary predeceases me, that beneficiary's share shall pass to their descendants, or if no descendants survive, to the remaining beneficiaries in equal shares.
              </p>
            </div>
          </div>

          {/* III. ASSETS SCHEDULE */}
          {content?.assets && content.assets.length > 0 && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">III. SCHEDULE OF ASSETS</h2>
              <div className="text-sm leading-relaxed">
                <p className="mb-3">The following assets comprise part of my estate:</p>
                {content.assets.map((asset: any, index: number) => (
                  <div key={index} className="mb-3 pl-4">
                    <p className="mb-1">
                      <strong>Asset {index + 1}:</strong> <span className="border-b border-black px-1">{asset.name || asset.description}</span>
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong> <span className="border-b border-black px-1">{asset.type}</span>
                    </p>
                    <p className="mb-1">
                      <strong>Estimated Value:</strong> <span className="border-b border-black px-1">${asset.value?.toLocaleString() || 'Not specified'}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IV. ALL REMAINING PROPERTY; RESIDUARY CLAUSE */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">IV. ALL REMAINING PROPERTY; RESIDUARY CLAUSE</h2>
            <div className="text-sm leading-relaxed">
              <p className="mb-3">
                I give, devise, and bequeath all of the rest, residue, and remainder of my estate, of whatever kind and character, and wherever located, to my beneficiaries as specified above in equal shares, or according to their designated percentages.
              </p>
              <p>
                If any beneficiary predeceases me, their share shall be distributed equally among the surviving beneficiaries, unless otherwise specified in this Will.
              </p>
            </div>
          </div>

          {/* V. SPECIAL INSTRUCTIONS */}
          {content?.specialRequests && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">V. SPECIAL INSTRUCTIONS</h2>
              <div className="text-sm leading-relaxed">
                <p className="whitespace-pre-wrap border border-gray-300 p-3 bg-gray-50">
                  {content.specialRequests}
                </p>
              </div>
            </div>
          )}

          {/* VI. ADDITIONAL PROVISIONS */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">VI. ADDITIONAL PROVISIONS</h2>
            <div className="text-sm leading-relaxed space-y-2">
              <p><strong>WAIVER OF BOND:</strong> My Executor and alternate Executor shall serve without any bond.</p>
              <p><strong>GOVERNING LAW:</strong> This document shall be governed by the laws in the State of California.</p>
              <p><strong>SEVERABILITY:</strong> If any part of this Will is declared invalid, illegal, or inoperative for any reason, it is my intent that the remaining parts shall be effective and fully operative.</p>
            </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="mt-8 pt-6 border-t-2 border-black">
            <div className="text-sm leading-relaxed">
                             <p className="mb-6">
                 <strong>IN WITNESS WHEREOF,</strong> I, <strong>{fullName}</strong>, hereby set my hand to this last Will, on each page of which I have placed my initials, executed on this date at <strong>{city}</strong>, State of California.
               </p>
               
               <div className="space-y-6 mb-8">
                 <div className="border border-gray-300 p-4 bg-gray-50">
                   <div className="text-center">
                     <div className="mb-2 font-medium">TESTATOR</div>
                     <div className="mb-4 border-b-2 border-gray-400 pb-2 mx-8"></div>
                     <div className="font-medium">{fullName}</div>
                     <div className="text-xs text-gray-600 mt-1">Testator Signature</div>
                   </div>
                 </div>
               </div>

                             <div className="mt-6">
                 <h3 className="text-base font-bold mb-3">WITNESSES</h3>
                 <p className="mb-4 text-xs text-gray-600">
                   The foregoing instrument was signed in our presence by {fullName} and declared by him/her to be his/her last Will. We, at his/her request and in his/her presence, and in the presence of each other, have subscribed our names below as witnesses.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="border border-gray-300 p-4 bg-gray-50">
                     <div className="text-center">
                       <div className="mb-2 font-medium text-sm">WITNESS #1</div>
                       <div className="mb-3 border-b-2 border-gray-400 pb-2 mx-4"></div>
                       <div className="text-xs text-gray-600">Witness Signature</div>
                       <div className="mt-3 border-b border-gray-300 pb-1 mx-2"></div>
                       <div className="text-xs text-gray-600 mt-1">Printed Name</div>
                       <div className="mt-3 border-b border-gray-300 pb-1"></div>
                       <div className="text-xs text-gray-600 mt-1">Address</div>
                     </div>
                   </div>
                   
                   <div className="border border-gray-300 p-4 bg-gray-50">
                     <div className="text-center">
                       <div className="mb-2 font-medium text-sm">WITNESS #2</div>
                       <div className="mb-3 border-b-2 border-gray-400 pb-2 mx-4"></div>
                       <div className="text-xs text-gray-600">Witness Signature</div>
                       <div className="mt-3 border-b border-gray-300 pb-1 mx-2"></div>
                       <div className="text-xs text-gray-600 mt-1">Printed Name</div>
                       <div className="mt-3 border-b border-gray-300 pb-1"></div>
                       <div className="text-xs text-gray-600 mt-1">Address</div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (document.document_type === 'living-trust') {
      const settlorName = content?.settlor?.name || content?.personalInfo?.firstName + ' ' + content?.personalInfo?.lastName || 'Unknown';
      const trusteeName = content?.trustee?.name || settlorName; // Often the settlor is also the initial trustee
      const trustName = `THE ${settlorName.toUpperCase()} REVOCABLE LIVING TRUST`;
      const dateSigned = content?.dateSigned || '_________________';
      
      return (
        <div className="space-y-6 text-black font-serif leading-relaxed">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-black mb-4 tracking-wider">
              {trustName}
            </h1>
            <div className="text-base mb-2">{dateSigned}</div>
          </div>

          {/* Opening Declaration */}
          <div className="mb-6 text-sm leading-relaxed">
            <p className="mb-4 font-bold">REVOCABLE LIVING TRUST AGREEMENT</p>
            <p className="mb-4">
              THIS REVOCABLE LIVING TRUST AGREEMENT, (hereinafter "Trust"), is being made by <strong>{settlorName}</strong>, as the Trustor, and <strong>{trusteeName}</strong>, serving as Trustee.
            </p>
            <p className="mb-4">
              This Trust shall be known as <strong>{trustName}</strong>, and shall be administered in accordance with the following terms:
            </p>
          </div>

          {/* Article I - Introduction */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE I</h2>
            <h3 className="text-base font-bold mb-3 text-center">INTRODUCTION</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(A) TRUST PURPOSE</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  Any person shall deal with the Trustee without the approval of any court, the Trustor, or any beneficiary of any Trust created by this Trust, and shall assume that the Trustee has the same power and authority to act as an individual does in the management of his or her own affairs.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(B) TRUST ASSETS</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  <strong>{settlorName}</strong>, as Trustor, does hereby assign, convey and deliver to the Trustee, all of the Trustor's right, title, and interest in and to all real and personal property, tangible or intangible, of any nature, in any location, which may be owned by the Trustor or later acquired by the Trustor.
                </p>
                {content?.assets && content.assets.length > 0 && (
                  <div className="mt-3 p-2 border border-gray-300">
                    <p className="font-bold mb-2">Trust Assets Include:</p>
                    {content.assets.map((asset: any, index: number) => (
                      <div key={index} className="mb-2">
                        <p>• {asset.name || asset.description} ({asset.type}) - ${asset.value?.toLocaleString() || 'Not specified'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Article II - Administration During Life */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE II</h2>
            <h3 className="text-base font-bold mb-3 text-center">ADMINISTRATION DURING THE LIFE OF THE TRUSTOR</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(A) TRUSTEE</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  The Trustee of this Trust shall be the Trustor, <strong>{settlorName}</strong>. If the Trustee cannot continue to serve for any reason, the Successor Trustee shall be:
                </p>
                {content?.successorTrustees && content.successorTrustees.length > 0 ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    {content.successorTrustees.map((trustee: any, index: number) => (
                      <p key={index} className="mb-1">
                        <strong>{index + 1}.</strong> {trustee.name}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-gray-600 italic">Successor trustee(s) to be designated.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(B) DISPOSITION OF INCOME AND PRINCIPAL</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  The Trustee shall manage the property of the Trust estate, collect the income, and shall pay from the income of the Trust such amounts and to such persons as the Trustor may from time to time direct. In the absence of direction, the Trustee may accumulate the net income or may disburse any portion of the net income to or for the benefit of the Trustor.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(C) RIGHT TO REVOKE AND AMEND</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  The Trustor, <span className="border-b border-black px-1">{settlorName}</span>, reserves the right while alive, except any period when incapacitated, at any time and from time to time, by an instrument in writing, signed, acknowledged, and delivered to the Trustee to revoke this instrument entirely or to alter or amend this instrument in any and every particular.
                </p>
              </div>
            </div>
          </div>

          {/* Article III - Administration After Death */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE III</h2>
            <h3 className="text-base font-bold mb-3 text-center">ADMINISTRATION AFTER THE DEATH OF THE TRUSTOR</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(A) SUCCESSOR TRUSTEE</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  Upon the death of the Trustor, the Successor Trustee shall continue to administer the assets of this Trust and shall distribute said assets as provided below.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(B) PAYMENT OF DEBTS AND EXPENSES</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  The Trustee may pay from the principal or income of the Trust such amounts as may be needed to pay all or any part of the deceased Trustor's just debts, funeral expenses, and administration expenses.
                </p>
              </div>
            </div>
          </div>

          {/* Article IV - Distribution of Trust Assets */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE IV</h2>
            <h3 className="text-base font-bold mb-3 text-center">DISTRIBUTION OF TRUST ASSETS</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(A) BENEFICIARY DISTRIBUTIONS</h4>
              <div className="text-xs leading-tight">
                <p className="mb-3">
                  Upon the death of the Trustor, and after payment of debts and expenses, the Trust assets shall be distributed as follows:
                </p>
                
                {content?.beneficiaries && content.beneficiaries.length > 0 ? (
                  content.beneficiaries.map((beneficiary: any, index: number) => (
                    <div key={index} className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="mb-2 font-semibold">
                        Beneficiary {index + 1}: {beneficiary.name || beneficiary.firstName + ' ' + beneficiary.lastName}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Relationship:</span> {beneficiary.relationship}
                        </div>
                        <div>
                          <span className="font-medium">Share:</span> {beneficiary.share || beneficiary.allocation + '%'} of trust estate
                        </div>
                        {beneficiary.address && (
                          <div className="col-span-2">
                            <span className="font-medium">Address:</span> {beneficiary.address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-gray-600 italic">
                      Trust beneficiaries to be distributed as specified in attached schedules.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(B) CONTINGENT BENEFICIARIES</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  In the event any beneficiary predeceases the Trustor, their share shall be distributed to their living descendants, or if no descendants survive, then to the remaining beneficiaries in equal shares.
                </p>
              </div>
            </div>
          </div>

          {/* Article V - Trustee Powers */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE V</h2>
            <h3 className="text-base font-bold mb-3 text-center">TRUSTEE POWERS</h3>
            
            <div className="text-xs leading-tight">
              <p className="mb-3">
                The Trustee shall have all powers necessary for the proper administration of this Trust, including but not limited to:
              </p>
              <div className="ml-4 space-y-1">
                <p>• To retain, sell, exchange, invest and reinvest Trust assets</p>
                <p>• To manage real estate and personal property</p>
                <p>• To borrow money and mortgage Trust property</p>
                <p>• To employ agents, attorneys, and advisors</p>
                <p>• To make distributions to beneficiaries</p>
                <p>• To file tax returns and pay taxes</p>
                <p>• To exercise all powers of an absolute owner</p>
              </div>
            </div>
          </div>

          {/* Article VI - General Provisions */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3 text-center">ARTICLE VI</h2>
            <h3 className="text-base font-bold mb-3 text-center">GENERAL PROVISIONS</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(A) GOVERNING LAW</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  This Trust shall be construed and regulated in all respects by the laws of the State of California.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">(B) SPENDTHRIFT PROVISION</h4>
              <div className="text-xs leading-tight">
                <p className="mb-2">
                  No beneficiary may assign, anticipate, encumber, or otherwise voluntarily transfer their interest in this Trust. Neither the income nor principal shall be subject to attachment or any legal process.
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-8 pt-6 border-t-2 border-black">
            <div className="text-sm leading-relaxed">
              <p className="mb-6">
                IN WITNESS WHEREOF, <strong>{settlorName}</strong> has signed this instrument as Trustor and as Trustee, to evidence acceptance of the Trust Agreement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-300 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="mb-2 font-medium">TRUSTOR</div>
                    <div className="mb-4 border-b-2 border-gray-400 pb-2 mx-8"></div>
                    <div className="font-medium">{settlorName}</div>
                    <div className="text-xs text-gray-600 mt-1">Trustor Signature</div>
                  </div>
                </div>
                
                <div className="border border-gray-300 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="mb-2 font-medium">TRUSTEE</div>
                    <div className="mb-4 border-b-2 border-gray-400 pb-2 mx-8"></div>
                    <div className="font-medium">{trusteeName}</div>
                    <div className="text-xs text-gray-600 mt-1">Trustee Signature</div>
                  </div>
                </div>
              </div>

              {/* Notary Section */}
              <div className="mt-6 border-t border-gray-300 pt-4">
                <div className="text-xs space-y-2">
                  <p className="font-bold">STATE OF CALIFORNIA</p>
                  <p className="font-bold">COUNTY OF _______________</p>
                  <p className="mt-4 leading-relaxed">
                    <strong>{settlorName}</strong>, Trustor and Trustee, being first duly sworn, does hereby declare to the undersigned officer/notary public that the Trustor signed the instrument as the Trustor's Revocable Trust Agreement, that the Trustee accepted this instrument as such, that the Trustor and Trustee signed the Trust Agreement as their voluntary act and deed.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div className="border border-gray-300 p-4 bg-white rounded">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="mb-2 text-sm font-medium">TRUSTOR</div>
                          <div className="border-b-2 border-gray-400 pb-2 mb-2"></div>
                          <div className="text-xs text-gray-600">{settlorName}</div>
                        </div>
                        <div className="text-center">
                          <div className="mb-2 text-sm font-medium">TRUSTEE</div>
                          <div className="border-b-2 border-gray-400 pb-2 mb-2"></div>
                          <div className="text-xs text-gray-600">{settlorName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-6">
                    SUBSCRIBED and sworn before me by <strong>{settlorName}</strong>, the Trustor and Trustee, on this date.
                  </p>
                  
                  <div className="mt-6 border border-gray-300 p-4 bg-yellow-50 rounded">
                    <div className="text-center">
                      <div className="mb-2 font-medium text-sm">NOTARY PUBLIC</div>
                      <div className="mb-3 border-b-2 border-gray-400 pb-2 mx-8"></div>
                      <div className="text-xs text-gray-600">Notary Signature & Seal</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Commission expires: _______________
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule A - Trust Assets */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h2 className="text-base font-bold mb-3 text-center">{trustName}</h2>
            <h3 className="text-base font-bold mb-3 text-center">Schedule A</h3>
            <h4 className="text-sm font-bold mb-3 text-center">Trust Assets</h4>
            
            <div className="text-xs">
              {content?.assets && content.assets.length > 0 ? (
                <div className="space-y-2">
                  {content.assets.map((asset: any, index: number) => (
                    <p key={index}>
                      {index + 1}. {asset.name || asset.description} - {asset.type} - ${asset.value?.toLocaleString() || 'Not specified'}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-sm mb-2">Initial Trust Funding:</p>
                  <p className="text-sm">• The sum of One Hundred Dollars ($100.00) in cash</p>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    Additional assets may be transferred to the trust at any time during the trustor's lifetime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (document.document_type === 'power-of-attorney') {
      const principalName = content?.principal?.name || content?.personalInfo?.firstName + ' ' + content?.personalInfo?.lastName || 'Unknown';
      const agentName = content?.agent?.name || 'Unknown';
      const agentAddress = content?.agent?.address || '_________________';
      
      return (
        <div className="space-y-6 text-black font-serif leading-relaxed">
          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-black mb-2 tracking-wider">
              UNIFORM STATUTORY FORM POWER OF ATTORNEY
            </h1>
            <div className="text-sm">(California Probate Code Section 4401)</div>
          </div>

          {/* Notice Section */}
          <div className="mb-6 p-4 border-2 border-black">
            <div className="text-xs font-bold text-center mb-2">NOTICE:</div>
            <div className="text-xs leading-tight">
              <p className="mb-2">
                THE POWERS GRANTED BY THIS DOCUMENT ARE BROAD AND SWEEPING. THEY ARE EXPLAINED IN THE UNIFORM STATUTORY FORM POWER OF ATTORNEY ACT (CALIFORNIA PROBATE CODE SECTIONS 4400-4465). THE POWERS LISTED IN THIS DOCUMENT DO NOT INCLUDE ALL POWERS THAT ARE AVAILABLE UNDER THE PROBATE CODE.
              </p>
              <p className="mb-2">
                IF YOU HAVE ANY QUESTIONS ABOUT THESE POWERS, OBTAIN COMPETENT LEGAL ADVICE. THIS DOCUMENT DOES NOT AUTHORIZE ANYONE TO MAKE MEDICAL AND OTHER HEALTH-CARE DECISIONS FOR YOU.
              </p>
              <p>
                YOU MAY REVOKE THIS POWER OF ATTORNEY IF YOU LATER WISH TO DO SO.
              </p>
            </div>
          </div>

          {/* Appointment Section */}
          <div className="mb-6 text-sm leading-relaxed">
            <div className="p-4 bg-gray-50 rounded mb-4">
              <p className="mb-2">
                <strong>Principal:</strong> {principalName}
              </p>
              <p className="mb-2">
                <strong>Appointed Agent:</strong> {agentName}
              </p>
              {agentAddress !== '_________________' && (
                <p className="text-sm text-gray-600">
                  <strong>Agent Address:</strong> {agentAddress}
                </p>
              )}
            </div>
            <p>
              I hereby appoint the above-named agent (attorney-in-fact) to act for me in any lawful way with respect to the following powers:
            </p>
          </div>

          {/* Powers Section */}
          <div className="mb-6">
            <div className="text-xs font-bold mb-3 p-2 bg-gray-100">
              <p className="mb-1">TO GRANT ALL OF THE FOLLOWING POWERS, INITIAL THE LINE IN FRONT OF (N) AND IGNORE THE LINES IN FRONT OF THE OTHER POWERS.</p>
              <p className="mb-1">TO GRANT ONE OR MORE, BUT FEWER THAN ALL, OF THE FOLLOWING POWERS, INITIAL THE LINE IN FRONT OF EACH POWER YOU ARE GRANTING.</p>
              <p>TO WITHHOLD A POWER, DO NOT INITIAL THE LINE IN FRONT OF IT. YOU MAY, BUT NEED NOT, CROSS OUT EACH POWER WITHHELD.</p>
            </div>
            
            <div className="text-sm space-y-3 ml-6">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(A)</span>
                  <span>Real property transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(B)</span>
                  <span>Tangible personal property transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(C)</span>
                  <span>Stock and bond transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(D)</span>
                  <span>Commodity and option transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(E)</span>
                  <span>Banking and other financial institution transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(F)</span>
                  <span>Business operating transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(G)</span>
                  <span>Insurance and annuity transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(H)</span>
                  <span>Estate, trust, and other beneficiary transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(I)</span>
                  <span>Claims and litigation</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(J)</span>
                  <span>Personal and family maintenance</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(K)</span>
                  <span>Benefits from social security, medicare, medicaid, or other governmental programs, or civil or military service</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(L)</span>
                  <span>Retirement plan transactions</span>
                </div>
                <div className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <span className="font-bold mr-3 text-blue-600">(M)</span>
                  <span>Tax matters</span>
                </div>
                <div className="flex items-start p-3 border-2 border-blue-300 rounded bg-blue-50">
                  <span className="font-bold mr-3 text-blue-700">(N)</span>
                  <span className="font-bold text-blue-700">ALL OF THE POWERS LISTED ABOVE</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs font-bold mt-3 text-center">
              YOU NEED NOT INITIAL ANY OTHER LINES IF YOU INITIAL LINE (N).
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">SPECIAL INSTRUCTIONS</h2>
            <div className="text-xs mb-2 text-gray-600">
              Additional instructions or limitations on the powers granted to the agent:
            </div>
            <div className="border border-gray-300 p-4 bg-gray-50 min-h-24 rounded">
              {content?.specialInstructions ? (
                <p className="text-sm">{content.specialInstructions}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No special instructions specified.</p>
              )}
            </div>
          </div>

          {/* Durability Clause */}
          <div className="mb-6 text-sm">
            <p className="mb-3 font-bold">
              UNLESS YOU DIRECT OTHERWISE ABOVE, THIS POWER OF ATTORNEY IS EFFECTIVE IMMEDIATELY AND WILL CONTINUE UNTIL IT IS REVOKED.
            </p>
            <p className="mb-2">
              This power of attorney will continue to be effective even though I become incapacitated.
            </p>
            <div className="text-xs font-bold">
              STRIKE THE PRECEDING SENTENCE IF YOU DO NOT WANT THIS POWER OF ATTORNEY TO CONTINUE IF YOU BECOME INCAPACITATED.
            </div>
          </div>

          {/* Multiple Agents */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">MULTIPLE AGENTS</h2>
            <div className="text-sm">
              <p className="mb-3">
                If more than one agent is designated, the agents shall act <strong>jointly</strong> unless otherwise specified.
              </p>
              <div className="text-xs p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>Note:</strong> Multiple agents must typically act together unless specifically authorized to act separately. This ensures important decisions are made with consensus.
              </div>
            </div>
          </div>

          {/* Third Party Reliance */}
          <div className="mb-6 text-sm">
            <p className="mb-3">
              I agree that any third party who receives a copy of this document may act under it. Revocation of the power of attorney is not effective as to a third party until the third party has actual knowledge of the revocation. I agree to indemnify the third party for any claims that arise against the third party because of reliance on this power of attorney.
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300">
            <div className="text-sm leading-relaxed">
              <p className="mb-6">
                This Power of Attorney is executed on this date in California.
              </p>
              
              <div className="border border-gray-300 p-6 bg-gray-50 rounded">
                <div className="text-center">
                  <div className="mb-2 font-medium">PRINCIPAL</div>
                  <div className="mb-4 border-b-2 border-gray-400 pb-2 mx-12"></div>
                  <div className="font-medium">{principalName}</div>
                  <div className="text-xs text-gray-600 mt-1">Principal Signature</div>
                </div>
              </div>

              <div className="text-xs font-bold mb-4">
                BY ACCEPTING OR ACTING UNDER THE APPOINTMENT, THE AGENT ASSUMES THE FIDUCIARY AND OTHER LEGAL RESPONSIBILITIES OF AN AGENT.
              </div>

              {/* Notary Section */}
              <div className="mt-6 border-t border-gray-300 pt-4">
                <h3 className="text-base font-bold mb-3">NOTARY ACKNOWLEDGMENT</h3>
                <div className="text-xs space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p><strong>State of California</strong></p>
                  <p><strong>County of _______________</strong></p>
                  <p className="mt-4 leading-relaxed">
                    On this date, before me personally appeared <strong>{principalName}</strong>, who proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument and acknowledged to me that he/she executed the same in his/her authorized capacity, and that by his/her signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.
                  </p>
                  <p className="mt-4">
                    I certify under PENALTY OF PERJURY under the laws of the State of California that the foregoing paragraph is true and correct.
                  </p>
                  
                  <div className="mt-6 border border-gray-300 p-4 bg-white rounded">
                    <div className="text-center">
                      <div className="mb-2 font-medium text-sm">NOTARY PUBLIC</div>
                      <div className="mb-3 border-b-2 border-gray-400 pb-2 mx-8"></div>
                      <div className="text-xs text-gray-600">Notary Signature & Seal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic fallback for other document types
    return (
      <div className="space-y-4 text-black">
        <div className="text-center border-b border-gray-300 pb-3 mb-4">
          <h1 className="text-lg font-bold text-black mb-1">
            {document.title.toUpperCase()}
          </h1>
          <h2 className="text-base text-black">
            {document.document_type.replace('-', ' ').toUpperCase()}
          </h2>
        </div>

        <div className="bg-white p-3 border border-gray-200 rounded">
          <pre className="whitespace-pre-wrap font-mono text-xs text-black">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-w-5xl mx-auto bg-white">
        {/* Document Header */}
        <div className="flex justify-between items-center mb-4 p-3 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-base font-medium text-gray-900">{document.title}</h2>
            <p className="text-xs text-gray-500">
              Status: <span className="font-medium">{document.status}</span> • 
              Progress: <span className="font-medium">{document.progress_percentage}%</span>
            </p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Created: {formatDate(document.created_at)}</p>
            <p>Updated: {formatDate(document.updated_at)}</p>
          </div>
        </div>

        {/* Document Content */}
        <div ref={contentRef} className="bg-white p-6 max-h-[70vh] overflow-y-auto">
          {formatDocumentContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4 p-3 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={generateEnhancedPDF}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save as PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer; 