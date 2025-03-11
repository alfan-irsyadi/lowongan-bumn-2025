import React from "react";
import DOMPurify from "dompurify";
import he from "he";

export function cleanHTML(jobDescription) {
    const decodedDescription = he.decode(jobDescription);
    const cleanedHTML = decodedDescription
        .replace(/<meta[^>]*>/g, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
        .replace(/<xml[^>]*>[\s\S]*?<\/xml>/g, '');

    return(DOMPurify.sanitize(cleanedHTML));
}

export function JobDetail({ jobDescription }) {
    const sanitizedDescription = cleanHTML(jobDescription)
    return (
        <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
    );
}


