import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileExcelOutlined,
  UserOutlined,
  LogoutOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Flex, Divider, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from './api';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from './modules/user/userSlice';
import { persistor } from './store';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const username = useSelector(state => state.user.username);
  const dispatch = useDispatch();
  const handleLogOut = () => {
    dispatch(logoutAction());
    sessionStorage.removeItem('userId');
    persistor.purge();
    navigate('/');
    logout().catch(() => { });
  }
  return (
    <Layout className="app-layout" style={{ minHeight: '100vh' }}>
      <Sider
        className="app-sider"
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ color: 'white', padding: '1.5rem', fontWeight: 'bold', fontSize: collapsed ? '0' : '16px', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'start', gap: '10px', }}>
          <Avatar style={{ backgroundColor: '#1677FF' }} icon={<UserOutlined />} />
          {!collapsed && <Typography.Text style={{ color: 'white' }} strong>{username}</Typography.Text>}
        </div>
        <div className="demo-logo-vertical" />
        <Divider type='horizontal' style={{ margin: '0 0 2rem 0', height: '1px', backgroundColor: 'white' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: '/project',
              icon: <ProjectOutlined />,
              label: 'Project',
            },
            {
              key: '/node',
              icon: <FileExcelOutlined />,
              label: 'Instance',
            },
            {
              key: '/user',
              icon: <UserOutlined />,
              label: 'User',
            }
          ]}
        />
      </Sider>

      <Layout style={{
        width: '100%',
        marginLeft: collapsed ? '80px' : '200px',
        transition: 'margin-left 0.2s'
      }}>
        <Header
          className="app-header"
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? '80px' : '200px',
            zIndex: 999,
            transition: 'left 0.2s'
          }}
        >
          {/* <div class='row'> */}
          {/* <div class='col-md-2 col-sm-2'> */}
          <div>
            <div>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
            </div>
            {/* <h2 class='col-md-10 col-sm-5' style={{ margin: 'auto 0' }}>Schema Management</h2> */}
          </div>
          <Flex gap='small' align='center'>
            <Divider type='vertical' style={{ height: '40px' }} />
            <Button onClick={handleLogOut} style={{ marginRight: '1rem' }} danger type='primary' shape='circle' icon={<LogoutOutlined />} />
          </Flex>
        </Header>

        <Content
          // className={`app-content ${collapsed ? 'collapsed' : ''}`}
          style={{
            margin: '88px 16px 24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 200px)',
            background: '#ffffff',
            borderRadius: borderRadiusLG,
            transition: 'margin-left 0.2s',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
