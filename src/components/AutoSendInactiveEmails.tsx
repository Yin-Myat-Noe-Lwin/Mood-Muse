import React, { useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { supabase } from '@/integrations/supabase/client';

const SERVICE_ID = 'service_2agbuwn';
const TEMPLATE_ID = 'template_r8cyeac';
const PUBLIC_KEY = 'mJHSgq7458-NOGWl9';

async function checkAndSendInactiveEmails() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, last_active_at, reminded, username')
    .lt('last_active_at', cutoff.toISOString())
    .eq('reminded', false);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Fetched users:', data);

  if (!data || data.length === 0) {
    console.log('No inactive users found.');
    return;
  }

  for (const user of data) {
    if (!user.email) {
      console.log('Skipping user with no email:', user);
      continue;
    }
    const templateParams = {
      email: user.email,
      name: user.username || 'User',
      last_active: user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'a while ago',
    };
    try {
      console.log('Attempting to send email to:', user.email, templateParams);
      const emailResult = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('EmailJS result:', emailResult);
      const { error: updateError, data: updateData } = await supabase.from('profiles').update({ reminded: true }).eq('id', user.id);
      if (updateError) {
        console.error(`Failed to update reminded for ${user.email}:`, updateError);
      } else {
        console.log(`Reminded field updated for ${user.email}:`, updateData);
      }
      console.log(`Email sent to ${user.email}`);
    } catch (err) {
      console.error(`Failed to send email to ${user.email}:`, err);
    }
  }
}

const AutoSendInactiveEmails: React.FC = () => {
  useEffect(() => {
    checkAndSendInactiveEmails();
  }, []);
  return null;
};

export default AutoSendInactiveEmails;
